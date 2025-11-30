import * as reviewService from "../services/review.service.js";

export const createReview = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { username, review, stars, product_id } = req.body;

  
    if (!user_id || !review || !stars || !product_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

 
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Stars must be between 1 and 5" });
    }

    const result = await reviewService.createReview({
      user_id,
      product_id,
      username,
      review,
      stars
    });

    if (result.alreadyReviewed) {
      return res.status(409).json({ error: "You have already reviewed this product" });
    }

    res.status(201).json(result.review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { product_id } = req.query;
    const reviews = await reviewService.getReviews(product_id);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProductReviewsWithStats = async (req, res) => {
  try {
    const { product_id } = req.params;
    const data = await reviewService.getProductReviewsWithStats(product_id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const review_id = req.params.id;
    const { review, stars } = req.body;

  
    if (!review || !stars) {
      return res.status(400).json({ error: "Missing required fields" });
    }

 
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Stars must be between 1 and 5" });
    }

    const result = await reviewService.updateReview(review_id, user_id, review, stars);

    if (!result.found) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    res.json(result.review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const review_id = req.params.id;

    const result = await reviewService.deleteReview(review_id, user_id);

    if (!result.found) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const checkUserReview = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { product_id } = req.params;

    const hasReviewed = await reviewService.checkUserReview(user_id, product_id);
    res.json({ hasReviewed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};