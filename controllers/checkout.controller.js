import * as checkoutService from "../services/checkout.service.js";

export const createOrder = async (req,res) => {
    try {
        const userId = req.user.userId;
        const { cartItems , shippingInfo , billingInfo , shippingMethod , promoCode } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({error: "Cart is empty"})
        }

        const orderId = await checkoutService.createOrder({
            userId,
            cartItems,
            shippingInfo,
            billingInfo,
            shippingMethod,
            promoCode
        });

       res.json({ success: true, orderId })
    } catch (err) {
      res.status(500).json({ error: "Failed to create order" });
  }
}