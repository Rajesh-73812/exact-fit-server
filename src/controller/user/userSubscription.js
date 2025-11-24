const userSubscription = require("../../services/userSubscription");
console.log(userSubscription);
const createSubScriptionPlan = async (req, res) => {
  // const { user_id, plan_id, property_type_id, start_date, end_date, price_total, payment_option,} = req.body;
  // try {
  //     const createPlan = await userSubscription.createSubscription();
  //     return res.status(201).json({
  //         success: true,
  //         message: "subscription plan created successfully",
  //     });
  // } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({
  //         success: false,
  //         error: error
  //     });
  // }
};

module.exports = {
  createSubScriptionPlan,
};
