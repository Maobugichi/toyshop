import { Router } from "express";
import { addToCart , getCartItems } from "../controllers/cartController.js";

const cartRouter = Router();

cartRouter.post('/add', addToCart);
cartRouter.get("/:cartId", getCartItems);

export default cartRouter