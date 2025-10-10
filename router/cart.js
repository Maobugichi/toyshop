import express from "express";
import pool from "../db"; 

const router = express.Router();


router.post("/add", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // Find or create a cart for this user
    let cart = await pool.query(
      "SELECT * FROM carts WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      cart = await pool.query(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
        [userId]
      );
    }

    const cartId = cart.rows[0].id;

    // Check if product already exists in cart
    const existingItem = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, productId]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2",
        [quantity, existingItem.rows[0].id]
      );
    } else {
      // Insert new cart item
      await pool.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
        [cartId, productId, quantity]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

export default router;
