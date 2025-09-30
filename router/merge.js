import { Router } from "express";
import pool from "../db.js";
import { checkAuth } from "../check-auth.js";

const mergeRouter = Router();

mergeRouter.use(checkAuth)

mergeRouter.post("/merge" , checkAuth , async (req,res) => {
    const userId = req.user.id;
    
    const guestCart = req.body.guestCart;

    if (!Array.isArray(guestCart)) {
        return res.status(400).json({error: "Invalid guest cart format"});
    }

    try {
        for (const item of guestCart) {
            const { product_id , quantity } = item;

            const existing = await pool.query(
                `SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2`,
                [userId, product_id]
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
                `INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)`,
                [userId, product_id, quantity]
                );
            }
        }
        const updatedCart = await pool.query(
        `SELECT ci.id, ci.product_id, ci.stock_quantity, p.base_name, p.price, p.images
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = $1`,
        [userId]
        );

        res.json({ success: true, cart: updatedCart.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Cart merge failed" });
    }
})

export default mergeRouter