import { Router } from "express";
import { addToCart , getCartItems , updateCartItem , removeCartItem } from "../controllers/cartController.js";

const cartRouter = Router();

cartRouter.post('/add', addToCart);
cartRouter.get("/:cartId", getCartItems);
cartRouter.put("/:cartItemId", updateCartItem); // update quantity
cartRouter.delete("/:cartItemId", removeCartItem); 

export default cartRouter