const DashboardService = require("../../services/dashboard");

// this getCounts for active,inactive and total technician and customer counting
const getCounts = async (req, res) => {
  const userId = req.user?.id;
  console.log(userId);

  // if(userId) {}

  try {
    const counts = await DashboardService.getUserTechnicianCounts();
    return res.status(200).json({
      success: true,
      message: "user and technician data fetched sucessfully!",
      data: counts,
    });
  } catch (error) {
    console.log(error);
  }
};

// return our top customer (by order)
const topCustomer = async (req, res) => {
  const userId = req.user?.id;
  console.log(userId);

  try {
    const results = await DashboardService.topUser();
    return res.status(200).json({
      success: true,
      message: "getting data sucessfully!",
      data: results,
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getCounts,
  topCustomer,
};
