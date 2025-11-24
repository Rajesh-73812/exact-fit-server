const subscriptionPlan = require("../../services/plan");

const getAllPlan = async (req, res) => {
  try {
    const plan = await subscriptionPlan.getAllPlan();
    return res.status(200).json({
      success: true,
      message: "plan fetched sucessfuly",
      data: plan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const getPlanBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const plan = await subscriptionPlan.getPlanBySlug(slug);
    return res.status(200).json({
      success: true,
      message: "plan fetched sucessfuly",
      data: plan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
module.exports = {
  getAllPlan,
  getPlanBySlug,
};
