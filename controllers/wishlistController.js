import * as wishlistService from "../services/wishListService.js"

export const getWishlists = async (req,res) => {
    try {
        const { userId } = req.user;
        const wishlists = await wishlistService.getUserWishLists(userId);
        res.status(200).json(wishlists);
    } catch(err) {
        res.status(500).json({error:err.message})
    }
}

export const createWishList = async (req,res) => {
    try {
        const { userId } = req.user;
        const { name } = req.body;

        const wishlist = await wishlistService.createWishList(userId,name);
        res.status(201).json(wishlist)
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

}

export const deleteWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { watchlistId } = req.params;
    
    await wishlistService.deleteWishList(watchlistId, userId);
    res.json({ message: "Watchlist deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWishlistItems = async (req, res) => {
  try {
    const { userId } = req.user;
    const { watchlistId } = req.params;
    
    const items = await wishlistService.getWishlistItems(watchlistId, userId);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addItemToWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { watchlistId } = req.params;
    const { productId } = req.body;
    
    const result = await wishlistService.addItemToWishlist(watchlistId, productId, userId);
    
    if (!result.authorized) {
      return res.status(403).json({ error: "Unauthorized or invalid watchlist" });
    }
    
    if (result.alreadyExists) {
      return res.status(409).json({ message: "Already in watchlist" });
    }
    
    res.status(201).json(result.item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeItemFromWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { watchlistId, productId } = req.params;
    
    const authorized = await wishlistService.removeItemFromWishlist(watchlistId, productId, userId);
    
    if (!authorized) {
      return res.status(403).json({ error: "Unauthorized or invalid watchlist" });
    }
    
    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};