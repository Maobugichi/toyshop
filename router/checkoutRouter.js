import { Router } from "express";
import { checkAuth } from "../check-auth.js";
import * as checkoutController from "../controllers/checkout.controller.js";

const checkoutRouter = Router();

checkoutRouter.post("/", checkAuth, checkoutController.createOrder);

export default checkoutRouter;