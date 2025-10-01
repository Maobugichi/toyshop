import { Router } from "express";
import pool from "../db.js";
import { checkAuth } from "../check-auth.js";

const checkoutRouter = Router();

checkoutRouter.post("/", checkAuth , async (req,res) => {
  const userId = req.user.userId;

  const { cartItems , shippingInfo , billingInfo , shippingMethod , promoCode } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({error:"Cart is empty"});
  }

  try {
    const orderResult = await pool.query("INSERT INTO orders (user_id , shipping_method , promo_code, status , created_at VALUES ($1,$2,$3,$4,NOW()) RETURNING id",
        [userId,shippingMethod,promoCode || null, "pending"]
    )

    const orderId = orderResult.rows[0].id;

    for (const item of cartItems) {
        const { product_id , quantity , price } = item;

        await pool.query(
            `INSERT INTO order_items (order_id , product_id,quantity,price,created_at) VALUES ($1 , $2 , $3, $4, NOW())`,
            [orderId,product_id,quantity,price] 
        );
    }

     await pool.query(
      `INSERT INTO order_shipping (order_id, email, first_name, last_name, company, address, apartment, city, state, zip, country, phone, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        orderId,
        shippingInfo.email,
        shippingInfo.firstName,
        shippingInfo.lastName,
        shippingInfo.company || null,
        shippingInfo.address,
        shippingInfo.apartment || null,
        shippingInfo.city,
        shippingInfo.state,
        shippingInfo.zip,
        shippingInfo.country,
        shippingInfo.phone || null
      ]
    );

    // 5. Insert billing info
    await pool.query(
      `INSERT INTO order_billing (order_id, same_as_shipping, first_name, last_name, company, address, apartment, city, state, zip, country, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [
        orderId,
        billingInfo.sameAsShipping,
        billingInfo.firstName || shippingInfo.firstName,
        billingInfo.lastName || shippingInfo.lastName,
        billingInfo.company || shippingInfo.company || null,
        billingInfo.address || shippingInfo.address,
        billingInfo.apartment || shippingInfo.apartment || null,
        billingInfo.city || shippingInfo.city,
        billingInfo.state || shippingInfo.state,
        billingInfo.zip || shippingInfo.zip,
        billingInfo.country || shippingInfo.country
      ]
    );
    res.json({ success: true, orderId });
  }  catch (err) {
  
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
})

export default checkoutRouter