const stripe = require("../../config/stripe");
const userSiubscriptionPayment = require("../models/userSubscriptionPayment");
const userSiubscription = require("../models/userSubscription");

const createInstallment = async (req, res) => {
  const { amount, currency = "AED", installments = 12 } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "Installment Plan" },
            unit_amount: amount / installments,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      billing_address_collection: "required",
    });

    await userSiubscriptionPayment.create({
      user_id: req.user.id,
      amount: amount / installments,
      status: "pending",
      transaction_id: session.id,
    });
    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSubscriptionPayment = async (req, res) => {
  const { price_id, customer_id } = req.body;
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customer_id,
      items: [{ price: price_id }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: { user_id: req.user.id },
    });

    const sub = await userSiubscription.create({
      user_id: req.user.id,
      paln_id: price_id,
      status: "active",
      price_total: subscription.items.data[0].price.unit_amount,
      payment_status: "paid",
    });

    await userSiubscriptionPayment.create({
      user_id: req.user.id,
      user_subscription_id: sub.id,
      amount: subscription.items.data[0].price.unit_amount,
      status: "paid",
      transaction_id: subscription.id,
      payment_method: "stripe",
    });
    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createInstallment,
  createSubscriptionPayment,
};
