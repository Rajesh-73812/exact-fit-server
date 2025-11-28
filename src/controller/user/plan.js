const subscriptionPlan = require("../../services/plan");

const getAllPlan = async (req, res) => {
  const user_id = req.user?.id;
  const { search, page = 1, limit = 10 } = req.query;
  try {
    const plan = await subscriptionPlan.getAllPlan({
      user_id,
      search,
      page,
      limit,
    });
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
