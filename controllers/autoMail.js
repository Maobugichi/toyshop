import nodemailer from 'nodemailer';

const brevoTransporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER, 
    pass: process.env.BREVO_SMTP_KEY,  
  },
});


export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    await brevoTransporter.sendMail({
      from: '"YourApp" <noreply@thetoyshop.net.ng>', // Use your domain
      to: userEmail,
      subject: 'Welcome to YourApp!',
      html: `
        <h1>Welcome, ${userName}!</h1>
        <p>Thanks for signing up. We're excited to have you on board.</p>
      `,
    });
    console.log('Welcome email sent');
  } catch (error) {
    console.error('Email error:', error);
  }
};


export const sendTrackingEmail = async (userEmail, orderId, trackingId) => {
  try {
    await brevoTransporter.sendMail({
      from: '"YourApp Orders" <orders@thetoyshop.net.ng>',
      to: userEmail,
      subject: `Order #${orderId} - Tracking Information`,
      html: `
        <h2>Your order is on its way!</h2>
        <p>Tracking ID: <strong>${trackingId}</strong></p>
        <a href="https://thetoyshop.net.ng/track/${trackingId}">Track your order</a>
      `,
    });
    console.log('Tracking email sent');
  } catch (error) {
    console.error('Email error:', error);
  }
};


export const sendPromotionalEmail = async (userEmail, promoCode) => {
  try {
    await brevoTransporter.sendMail({
      from: '"YourApp Deals" <deals@thetoyshop.net.ng>',
      to: userEmail,
      subject: '🎉 Special Offer Just for You!',
      html: `
        <h2>Exclusive 20% Off!</h2>
        <p>Use code: <strong>${promoCode}</strong></p>
        <p>Valid for 48 hours only.</p>
      `,
    });
    console.log('Promo email sent');
  } catch (error) {
    console.error('Email error:', error);
  }
};