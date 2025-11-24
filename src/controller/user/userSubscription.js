const userSubscription = require("../../services/userSubscription");

const createSubScriptionPlan = async (req, res) => {
  // const { user_id, plan_id, property_type_id, start_date, end_date, price_total, payment_option,} = req.body;
  // try {
  const createPlan = await userSubscription.createSubscription();
  console.log(createPlan);

  //     return res.status(201).json({
  //         success: true,
  //         message: "subscription plan created successfully",
  //     });
  // } catch (error) {
  //     console.error(error);
  // }
};

module.exports = {
  createSubScriptionPlan,
};
