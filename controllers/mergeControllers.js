import * as mergeService from "../services/merge.service.js";

export const mergeCart = async (req,res) => {
    try {
        const userId = req.user.userId;
        const guestCart = req.body.guestCart;

         if (!Array.isArray(guestCart)) {
            return res.status(400).json({ error: "Invalid guest cart format" });
        }

        const cart = await mergeService.mergeGuestCart(userId, guestCart);

        res.json({ success: true, cart });   
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Cart merge failed" });
    }
}