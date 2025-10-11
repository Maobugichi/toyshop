import { Router } from "express";
import axios from "axios";
import crypto from "crypto";
import pool from "../db.js";

const nowRouter = Router();

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const BASE_URL = process.env.BASE_URL;
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET; // Add this to your .env


function verifyWebhookSignature(req, ipnSecret) {
  const receivedSignature = req.headers['x-nowpayments-sig'];
  if (!receivedSignature || !ipnSecret) return false;
  
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha512', ipnSecret)
    .update(payload)
    .digest('hex');
  
  return receivedSignature === expectedSignature;
}


nowRouter.get('/currencies', async (req, res) => {
  try {
    const responseList = await axios.get(`${BASE_URL}/currencies`, {
      headers: {
        "x-api-key": API_KEY,
      },
    });
    res.json(responseList.data);
  } catch (err) {
    console.error("Currencies fetch error:", err);
    res.status(500).json({ error: "Failed to fetch currencies" });
  }
});


nowRouter.post("/create-payment", async (req, res) => {
  try {
    const { order_id, price_amount, price_currency, pay_currency, order_description } = req.body;

    
    if (!order_id || !price_amount || !pay_currency) {
      return res.status(400).json({ 
        error: "Missing required fields: order_id, price_amount, pay_currency" 
      });
    }

    
    const response = await axios.post(
      `${BASE_URL}/payment`,
      {
        price_amount,
        price_currency: price_currency || 'usd',
        pay_currency,
        order_description: order_description || "Order payment via NOWPayments",
        order_id,
        ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/webhook`, // Your webhook URL
      },
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const data = response.data;
    console.log("Payment created:", data);

   
    await pool.query(
      `INSERT INTO payments (
        order_id, 
        payment_id, 
        pay_currency, 
        price_currency, 
        price_amount, 
        pay_amount,
        pay_address,
        payment_status,
        network,
        expiration_estimate_date,
        valid_until,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (payment_id) DO UPDATE SET
        payment_status = EXCLUDED.payment_status,
        updated_at = NOW()`,
      [
        order_id,
        data.payment_id,
        data.pay_currency,
        data.price_currency || 'usd',
        data.price_amount,
        data.pay_amount,
        data.pay_address,
        data.payment_status,
        data.network || 'eth',
        data.expiration_estimate_date,
        data.valid_until,
      ]
    );

    res.json(data);
  } catch (err) {
    console.error("Create payment error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Failed to create payment",
      message: err.response?.data?.message || err.message 
    });
  }
});


nowRouter.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    
    const result = await pool.query(
      `SELECT * FROM payments WHERE payment_id = $1`,
      [paymentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const payment = result.rows[0];

 
    try {
      const response = await axios.get(
        `${BASE_URL}/payment/${paymentId}`,
        {
          headers: {
            'x-api-key': API_KEY,
          },
        }
      );

      const apiData = response.data;

    
      if (apiData.payment_status !== payment.payment_status) {
        await pool.query(
          `UPDATE payments 
           SET payment_status = $1, 
               amount_received = $2,
               updated_at = NOW() 
           WHERE payment_id = $3`,
          [
            apiData.payment_status, 
            apiData.actually_paid || apiData.amount_received || 0,
            paymentId
          ]
        );

       
        if (apiData.payment_status === 'finished' || apiData.payment_status === 'confirmed') {
          await pool.query(
            `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE order_id = $1`,
            [payment.order_id]
          );
        }
      }

      
      res.json({
        payment_id: paymentId,
        payment_status: apiData.payment_status,
        amount_received: apiData.actually_paid || apiData.amount_received || 0,
        pay_amount: payment.pay_amount,
        pay_address: payment.pay_address,
        pay_currency: payment.pay_currency,
        price_amount: payment.price_amount,
        order_id: payment.order_id,
        network: payment.network,
        expiration_estimate_date: payment.expiration_estimate_date,
        valid_until: payment.valid_until,
        created_at: payment.created_at,
      });
    } catch (apiError) {
    
      console.warn("Failed to fetch from NOWPayments API, using DB data:", apiError.message);
      res.json({
        payment_id: paymentId,
        payment_status: payment.payment_status,
        amount_received: payment.amount_received || 0,
        pay_amount: payment.pay_amount,
        pay_address: payment.pay_address,
        pay_currency: payment.pay_currency,
        price_amount: payment.price_amount,
        order_id: payment.order_id,
        network: payment.network,
        expiration_estimate_date: payment.expiration_estimate_date,
        valid_until: payment.valid_until,
        created_at: payment.created_at,
      });
    }
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ error: "Failed to check payment status" });
  }
});


nowRouter.post("/webhook", async (req, res) => {
  try {
    const p = req.body;
    console.log("NOWPayments webhook received:", JSON.stringify(p, null, 2));

    if (IPN_SECRET) {
      const isValid = verifyWebhookSignature(req, IPN_SECRET);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return res.status(403).json({ error: "Invalid signature" });
      }
    }

    // Update payment in database
    const updateResult = await pool.query(
      `UPDATE payments
       SET payment_status = $1, 
           amount_received = $2, 
           tx_id = $3, 
           updated_at = NOW()
       WHERE payment_id = $4
       RETURNING order_id, payment_status`,
      [
        p.payment_status,
        p.actually_paid || p.amount_received || 0,
        p.payment_tx_id || p.pay_tx_id,
        p.payment_id
      ]
    );

    if (updateResult.rows.length === 0) {
      console.warn(`Payment ${p.payment_id} not found in database`);
      return res.status(404).json({ error: "Payment not found" });
    }

    const { order_id, payment_status } = updateResult.rows[0];

    
    /*switch (p.payment_status) {
      case "finished":
      case "confirmed":
        await pool.query(
          `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE order_id = $1`,
          [order_id]
        );
        console.log(`✅ Order ${order_id} marked as PAID`);
        break;

      case "partially_paid":
        console.log(`⚠️ Partial payment received for order ${order_id}`);
        await pool.query(
          `UPDATE orders SET status = 'partially_paid', updated_at = NOW() WHERE order_id = $1`,
          [order_id]
        );
        break;

      case "expired":
        await pool.query(
          `UPDATE orders SET status = 'expired', updated_at = NOW() WHERE order_id = $1`,
          [order_id]
        );
        console.log(`❌ Payment expired for order ${order_id}`);
        break;

      case "failed":
        await pool.query(
          `UPDATE orders SET status = 'failed', updated_at = NOW() WHERE order_id = $1`,
          [order_id]
        );
        console.log(`❌ Payment failed for order ${order_id}`);
        break;

      case "waiting":
      case "confirming":
        console.log(`⏳ Payment ${payment_status} for order ${order_id}`);
        break;

      default:
        console.log(`ℹ️ Unknown payment status: ${p.payment_status}`);
    }*/

    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default nowRouter;