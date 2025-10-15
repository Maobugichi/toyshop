
import Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;


const sendEmail = async (emailData) => {
  try {
    const response = await apiInstance.sendTransacEmail(emailData);
    console.log("✅ Email sent:", response?.messageId || "Success");
  } catch (error) {
    console.error("❌ Email error:", error?.response?.text || error.message);
  }
};


export const sendWelcomeEmail = async (userEmail, userName) => {
  await sendEmail({
    to: [{ email: userEmail, name: userName }],
    sender: { email: "noreply@thetoyshop.net.ng", name: "YourApp" },
    subject: "Welcome to YourApp!",
    htmlContent: `
      <div style="font-family: sans-serif; text-align: center;">
        <img src="https://res.cloudinary.com/dao2a3ib4/image/upload/v1759248907/toy-logoo_qt8unk.png" 
             alt="YourApp Logo" width="100" style="margin-bottom: 20px;" />
        <h1>Welcome, ${userName}!</h1>
        <p>Thanks for signing up. We're excited to have you on board 🎉</p>
      </div>
    `,
  });
};


export const sendTrackingEmail = async (userEmail, orderId, trackingId) => {
  await sendEmail({
    to: [{ email: userEmail }],
    sender: { email: "orders@thetoyshop.net.ng", name: "YourApp Orders" },
    subject: `Order #${orderId} - Tracking Information`,
    htmlContent: `
      <div style="font-family: sans-serif; text-align: center;">
        <img src="https://res.cloudinary.com/dao2a3ib4/image/upload/v1759248907/toy-logoo_qt8unk.png" 
             alt="YourApp Logo" width="100" style="margin-bottom: 20px;" />
        <h2>Your order is on its way!</h2>
        <p>Tracking ID: <strong>${trackingId}</strong></p>
        <a href="https://thetoyshop.net.ng/track/${trackingId}" 
           style="color:#007bff;text-decoration:none;font-weight:bold;">
           Track your order
        </a>
      </div>
    `,
  });
};


export const sendPromotionalEmail = async (userEmail, promoCode) => {
  await sendEmail({
    to: [{ email: userEmail }],
    sender: { email: "deals@thetoyshop.net.ng", name: "YourApp Deals" },
    subject: "🎉 Special Offer Just for You!",
    htmlContent: `
      <div style="font-family: sans-serif; text-align: center;">
        <h2>Exclusive 20% Off!</h2>
        <p>Use code: <strong>${promoCode}</strong></p>
        <p>Valid for 48 hours only.</p>
      </div>
    `,
  });
};
