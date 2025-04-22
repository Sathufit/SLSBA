const express = require("express");
require('dotenv').config();
<<<<<<< HEAD
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // ✅ Load from .env
=======
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { amount, registrationData } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Tournament Registration",
              description: "Entry fee for tournament",
            },
            unit_amount: amount, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
