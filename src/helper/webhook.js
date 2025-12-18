const app = require("../../server");
const stripe = require("../config/stripe");
const bodyParser = require("body-parser");
const userSiubscriptionPayment = require("../models/userSubscriptionPayment");

app.post(
  "/api/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    let paymentIntent;
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "payment_intent.succeeded") {
        paymentIntent = event.data.object;
        await userSiubscriptionPayment.update(
          {
            status: "paid",
            paid_date: new Date(),
          },
          {
            where: { transaction_id: paymentIntent.id },
          }
        );
      } else if (event.type === "payment_intent.payment_failed") {
        await userSiubscriptionPayment.update(
          { status: "failed" },
          {
            where: { transaction_id: paymentIntent.id },
          }
        );
      } else if (event.type === "invoice.paid") {
        console.log("subscription paid");
      }
      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);
