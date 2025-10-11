import { Router } from "express";
import pool from "../db.js";
import { checkAuth } from "../check-auth.js";

const reviewRouter = Router();


reviewRouter.post("/", checkAuth , async (req, res) => {
 const user_id = req.user.userId;
  try {
    const { username, review, stars } = req.body;
    if (!user_id || !review || !stars)
      return res.status(400).json({ error: "Missing required fields" });

    const result = await pool.query(
      `INSERT INTO reviews (user_id, username, review, stars)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, username, review, stars]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


reviewRouter.get("/" , async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reviews ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default reviewRouter;
