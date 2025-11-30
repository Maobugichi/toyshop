import { Router } from "express";
import { checkAuth } from "../middleware/check-auth.js";
import * as wishlistController from "../controllers/wishListController.js"

const wishRouter = Router();

wishRouter.get("/",checkAuth,wishlistController.getWishlists)
wishRouter.post("/", checkAuth ,wishlistController.createWishList);
wishRouter.delete("/:watchlistId", checkAuth,wishlistController.deleteWishlist );


wishRouter.get("/:watchlistId/items", checkAuth, wishlistController.getWishlistItems);
wishRouter.post("/:watchlistId/items", checkAuth, wishlistController.addItemToWishlist);
wishRouter.delete("/:watchlistId/items/:productId", checkAuth, wishlistController.removeItemFromWishlist);


export default wishRouter;
