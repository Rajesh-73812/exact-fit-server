const userSubscription = require("../../services/userSubscription");

const createSubScriptionPlan = async (req, res) => {
  const {
    plan_id,
    property_type_id,
    start_date,
    end_date,
    price_total,
    payment_option,
  } = req.body;
  const created_by = req.user.id || {};

  try {
    const subscription = await userSubscription.createSubscription({
      user_id: created_by,
      plan_id,
      property_type_id,
      start_date,
      end_date,
      price_total,
      payment_option,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      subscription,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong",
    });
  }
};

module.exports = {
  createSubScriptionPlan,
};
