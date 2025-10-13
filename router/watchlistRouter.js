import { Router } from "express";
import pool from "../db.js";
import { checkAuth } from "../check-auth.js";

const wishRouter = Router();

wishRouter.get("/",  checkAuth, async (req, res) => {
    const { userId } = req.user;
    const check = await pool.query(
    `SELECT id FROM watchlists WHERE user_id = $1`,
    [userId]
    );

    if (check.rows.length === 0) {
    await pool.query(
        `INSERT INTO watchlists (user_id, name) VALUES ($1, 'Default')`,
        [userId]
    );
    }

  try {
   
    const result = await pool.query(
      `SELECT id, name, created_at 
       FROM watchlists 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


wishRouter.post("/", checkAuth , async (req, res) => {
  try {
    const { userId } = req.user;
    console.log(req.user)
    console.log(userId)
    const { name } = req.body;

    const result = await pool.query(
      `INSERT INTO watchlists (user_id, name) 
       VALUES ($1, $2) 
       RETURNING *`,
      [userId, name || "Default"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


wishRouter.delete("/:watchlistId", checkAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { watchlistId } = req.params;

    await pool.query(
      `DELETE FROM watchlists 
       WHERE id = $1 AND user_id = $2`,
      [watchlistId, userId]
    );

    res.json({ message: "Watchlist deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


wishRouter.get("/:watchlistId/items", checkAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { watchlistId } = req.params;

    const result = await pool.query(
      `SELECT wi.id, wi.product_id, p.name, p.price, p.image_url, wi.added_at
       FROM watchlist_items wi
       JOIN products p ON wi.product_id = p.id
       JOIN watchlists w ON wi.watchlist_id = w.id
       WHERE wi.watchlist_id = $1 AND w.user_id = $2
       ORDER BY wi.added_at DESC`,
      [watchlistId, userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


wishRouter.post("/:watchlistId/items", checkAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { watchlistId } = req.params;
    const { productId } = req.body;

  
    const check = await pool.query(
      `SELECT id FROM watchlists WHERE id = $1 AND user_id = $2`,
      [watchlistId, userId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized or invalid watchlist" });
    }

    const result = await pool.query(
      `INSERT INTO watchlist_items (watchlist_id, product_id) 
       VALUES ($1, $2)
       ON CONFLICT (watchlist_id, product_id) DO NOTHING
       RETURNING *`,
      [watchlistId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ message: "Already in watchlist" });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


wishRouter.delete("/:watchlistId/items/:productId", checkAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { watchlistId, productId } = req.params;

   
    const check = await pool.query(
      `SELECT id FROM watchlists WHERE id = $1 AND user_id = $2`,
      [watchlistId, userId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized or invalid watchlist" });
    }

    await pool.query(
      `DELETE FROM watchlist_items 
       WHERE watchlist_id = $1 AND product_id = $2`,
      [watchlistId, productId]
    );

    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default wishRouter;
