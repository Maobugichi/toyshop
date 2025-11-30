import pool from "../configs/db.js"

export async function getOrCreateCart(userId) {
  const existing = await pool.query(
    "SELECT id FROM carts WHERE user_id = $1",
    [userId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const newCart = await pool.query(
    "INSERT INTO carts (user_id, created_at) VALUES ($1, NOW()) RETURNING id",
    [userId]
  );

  return newCart.rows[0].id;
}
