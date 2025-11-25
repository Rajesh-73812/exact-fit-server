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
  // const { plan_id, service_id, subservice_id, address_id, } = req.body;
  // const user_id = req.user.id || {};
  // try {
  // } catch (error) {
  // }
};
module.exports = {
  createSubScriptionPlan,
  createCustomSubScriptionPlan,
};
