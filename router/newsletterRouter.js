import { Router} from "express";
import pool from "../db.js";
import { sendWelcomeEmail } from "../controllers/autoMail.js";

const newsletterRouter = Router();


newsletterRouter.post("/subscribe", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const checkExisting = await pool.query(
      "SELECT * FROM newsletter_subscribers WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (checkExisting.rows.length > 0) {
      return res.status(409).json({ message: "You’re already subscribed!" });
    }

    await pool.query(
      "INSERT INTO newsletter_subscribers (email, name) VALUES ($1, $2)",
      [email, name || null]
    );
    const text = "Thanks for subscribing. We're excited to have you on board "
    await sendWelcomeEmail(email,name,text);

    res.status(201).json({ message: "Subscription successful 🎉" });
  } catch (err) {
    console.error("Newsletter error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default newsletterRouter;
