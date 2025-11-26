const userSubscription = require("../../services/userSubscription");

const createSubScriptionPlan = async (req, res) => {
  const {
    plan_id,
    property_type_id,
    address_id,
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
      address_id,
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

const createCustomSubScriptionPlan = async (req, res) => {
  const { address_id, start_date, payment_option, end_date, services } =
    req.body;
  const user_id = req.user.id || {};
  try {
    if (
      !user_id ||
      !address_id ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid subscription data. Please provide valid user_id, address_id, plan_id, and services.",
      });
    }

    const subscription = await userSubscription.createCustomSubScriptionPlan({
      user_id,
      address_id,
      start_date,
      payment_option,
      end_date,
      services,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully.",
      data: subscription,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subscription.",
      error: error.message,
    });
  }
};

const getAllSubscription = async (req, res) => {
  const user_id = req.user.id || {};
  const { limit, offset, status } = req.query;
  try {
    const result = await userSubscription.getAllSubscriptionsForUser(user_id, {
      limit,
      offset,
      status,
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  createSubScriptionPlan,
  createCustomSubScriptionPlan,
  getAllSubscription,
};
