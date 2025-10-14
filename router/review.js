import { Router } from "express";
import pool from "../db.js";
import { checkAuth } from "../check-auth.js";

const reviewRouter = Router();

reviewRouter.post("/", checkAuth, async (req, res) => {
  const user_id = req.user.userId;

  try {
    const { username, review, stars, product_id } = req.body;
    
    // Validate required fields
    if (!user_id || !review || !stars || !product_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate stars range
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Stars must be between 1 and 5" });
    }

    // Check if user already reviewed this product
    const existingReview = await pool.query(
      `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2`,
      [user_id, product_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({ error: "You have already reviewed this product" });
    }

    // Insert the review
    const result = await pool.query(
      `INSERT INTO reviews (user_id, product_id, username, review, stars)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, product_id, username, review, stars]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all reviews (optionally filter by product_id)
reviewRouter.get("/", async (req, res) => {
  try {
    const { product_id } = req.query;

    let query;
    let params = [];

    if (product_id) {
      // Get reviews for a specific product
      query = `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`;
      params = [product_id];
    } else {
      // Get all reviews
      query = `SELECT * FROM reviews ORDER BY created_at DESC`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get reviews for a specific product with stats
reviewRouter.get("/product/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;

    // Get reviews
    const reviewsResult = await pool.query(
      `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`,
      [product_id]
    );

      const statsResult = await pool.query(
      `SELECT 
        COALESCE(ROUND(AVG(stars)::numeric, 2), 0)::float as avg_rating,
        COUNT(*)::int as review_count
      FROM reviews 
      WHERE product_id = $1`,
      [product_id]
    );

    res.json({
      reviews: reviewsResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a review (user can only update their own)
reviewRouter.put("/:id", checkAuth, async (req, res) => {
  const user_id = req.user.userId;
  const review_id = req.params.id;

  try {
    const { review, stars } = req.body;

    if (!review || !stars) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Stars must be between 1 and 5" });
    }

    // Check if review exists and belongs to user
    const checkResult = await pool.query(
      `SELECT * FROM reviews WHERE id = $1 AND user_id = $2`,
      [review_id, user_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    // Update the review
    const result = await pool.query(
      `UPDATE reviews 
       SET review = $1, stars = $2, created_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [review, stars, review_id, user_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a review (user can only delete their own)
reviewRouter.delete("/:id", checkAuth, async (req, res) => {
  const user_id = req.user.userId;
  const review_id = req.params.id;

  try {
    const result = await pool.query(
      `DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *`,
      [review_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Check if user has reviewed a product
reviewRouter.get("/check/:product_id", checkAuth, async (req, res) => {
  const user_id = req.user.userId;
  const { product_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2`,
      [user_id, product_id]
    );

    res.json({ hasReviewed: result.rows.length > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default reviewRouter;