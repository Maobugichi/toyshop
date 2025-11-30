import { Router } from "express";
import { checkAuth } from "../check-auth.js";
import * as reviewController from "../controllers/review.controller.js";

const reviewRouter = Router();


reviewRouter.post("/", checkAuth, reviewController.createReview);


reviewRouter.get("/", reviewController.getReviews);


reviewRouter.get("/product/:product_id", reviewController.getProductReviewsWithStats);


reviewRouter.get("/check/:product_id", checkAuth, reviewController.checkUserReview);


reviewRouter.put("/:id", checkAuth, reviewController.updateReview);


reviewRouter.delete("/:id", checkAuth, reviewController.deleteReview);

export default reviewRouter;