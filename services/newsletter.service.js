import pool from "../configs/db.js"
import { sendWelcomeEmail } from "../utils/autoMail.js";

export const subscribeToNewsletter = async (email, name) => {

  const checkExisting = await pool.query(
    "SELECT * FROM newsletter_subscribers WHERE LOWER(email) = LOWER($1)",
    [email]
  );

  if (checkExisting.rows.length > 0) {
    return { alreadySubscribed: true };
  }


  await pool.query(
    "INSERT INTO newsletter_subscribers (email, name) VALUES ($1, $2)",
    [email, name || null]
  );

 
  const text = "Thanks for subscribing. We're excited to have you on board";
  await sendWelcomeEmail(email, name, text);

  return { alreadySubscribed: false };
};