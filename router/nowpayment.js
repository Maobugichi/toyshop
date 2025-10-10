import { Router } from "express";
import axios from "axios";
import pool from "../db.js";

const nowRouter = Router();


const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const BASE_URL = process.env.BASE_URL;

nowRouter.get('/currencies' , async (req,res) => {
    try {
       const responseList = await axios.get(`${BASE_URL}/currencies`,
        {
        headers: {
          "x-api-key": API_KEY,
        },
      }
     )
     res.json(responseList.data)
    } catch(err) {
        console.log(err)
        res.status(500).json(err)
    }
    
})

nowRouter.post("/create-payment", async (req, res) => {
  try {
    const { order_id , price_amount, price_currency, pay_currency, order_description } = req.body;

    const response = await axios.post(
      `${BASE_URL}/payment`,
      {
        price_amount,
        price_currency:'usd',
        pay_currency,
        order_description,
        order_id,
        success_url: "https://yourfrontend.com/success",
        cancel_url: "https://yourfrontend.com/cancel",
      },
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    await pool.query(
      `INSERT INTO payments (order_id, payment_id, invoice_url, pay_currency, price_currency, price_amount, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (payment_id) DO NOTHING`,
      [
        order_id,
        data.payment_id,
        data.invoice_url || data.payment_url,
        pay_currency,
        price_currency,
        price_amount,
        data.payment_status,
      ]
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create payment" });
  }
});


nowRouter.post("/webhook", async (req, res) => {
  try {
    const p = req.body;
    console.log("NOWPayments webhook:", p);

    await pool.query(
      `UPDATE payments
       SET payment_status = $1, pay_amount = $2, tx_id = $3, updated_at = NOW()
       WHERE payment_id = $4`,
      [p.payment_status, p.pay_amount, p.payment_tx_id, p.payment_id]
    );

    if (p.payment_status === "finished") {
      await pool.query(`UPDATE orders SET status = 'paid' WHERE id = $1`, [p.order_id]);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

export default nowRouter;
