import * as newsletterService from "../services/newsletter.service.js";

export const subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;

  
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

   
    const result = await newsletterService.subscribeToNewsletter(email, name);

    if (result.alreadySubscribed) {
      return res.status(409).json({ message: "You're already subscribed!" });
    }

    res.status(201).json({ message: "Subscription successful 🎉" });
  } catch (err) {
    console.error("Newsletter error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};