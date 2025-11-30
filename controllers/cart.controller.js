import pool from "../configs/db.js"

export async function addToCart(req,res) {
    const { cartId , productId , quantity } = req.body;

    if (!cartId || !productId) {
        return res.status(400).json({ error: "cartId and productId are required" });
    }

    try {
        const existing = await pool.query(
            "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2",
            [cartId , productId]
        ); 

        if (existing.rows.length > 0) {
            const updated = await pool.query(
                "UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *",
                [quantity || 1,cartId,productId]
            );
            return res.json(updated.rows[0]);
        } else {
            const inserted = await pool.query(
                "INSERT INTO cart_items (cart_id , product_id, quantity, created_at) VALUES ($1,$2,$3,NOW()) RETURNING *",
                [cartId,productId,quantity || 1]
            );
            return res.json(inserted.rows[0])
        }
    } catch(err) {
       console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Server error" }); 
    }
}

export async function getCartItems(req,res) {
    const { cartId } = req.params;

    try {
        const items = await pool.query(
         `SELECT ci. *, p.base_name , p.price , p.images , p.stock_quantity
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.cart_id = $1
         `,
         [cartId]
        )
        res.json(items.rows)
    } catch(err) {
        console.error("Error fetching cart items:", err);
        res.status(500).json({ error: "Server error" }); 
    }
}


export async function updateCartItem(req, res) {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }

  try {
    const updated = await pool.query(
      `UPDATE cart_items 
       SET quantity = $1 
       WHERE id = $2 
       RETURNING *`,
      [quantity, cartItemId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ error: "Server error" });
  }
}


export async function removeCartItem(req, res) {
  const { cartItemId } = req.params;

  try {
    const deleted = await pool.query(
      `DELETE FROM cart_items WHERE id = $1 RETURNING *`,
      [cartItemId]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json({ success: true, item: deleted.rows[0] });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ error: "Server error" });
  }
}
