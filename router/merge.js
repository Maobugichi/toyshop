import { Router } from "express"; 
import pool from "../db.js";
import { checkAuth } from "../check-auth.js";

const mergeRouter = Router();

mergeRouter.post("/merge", checkAuth, async (req, res) => {
  const userId = req.user.userId;
  const guestCart = req.body.guestCart;

  if (!Array.isArray(guestCart)) {
    return res.status(400).json({ error: "Invalid guest cart format" });
  }

  try {
    // 1. Ensure the user has a cart
    let { rows: carts } = await pool.query(
      `SELECT id FROM carts WHERE user_id = $1`,
      [userId]
    );

    let cartId;
    if (carts.length > 0) {
      cartId = carts[0].id;
    } else {
      const { rows } = await pool.query(
        `INSERT INTO carts (user_id, created_at) VALUES ($1, NOW()) RETURNING id`,
        [userId]
      );
      cartId = rows[0].id;
    }

    
    for (const item of guestCart) {
      const { product_id, quantity } = item;

      const existing = await pool.query(
        `SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
        [cartId, product_id]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE cart_items 
           SET quantity = quantity + $1
           WHERE id = $2`,
          [quantity, existing.rows[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, created_at)
           VALUES ($1, $2, $3, NOW())`,
          [cartId, product_id, quantity]
        );
      }
    }

    // 3. Return updated cart
    const updatedCart = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, 
              p.base_name, p.price, p.images
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    res.json({ success: true, cart: updatedCart.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cart merge failed" });
  }
});

export default mergeRouter;
