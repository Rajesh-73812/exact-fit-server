const dashboardService = require("../../services/dashboard");

const getAllServices = async (req, res) => {
  // const userId = req.user?.id || null;
  const {
    q,
    category,
    is_active,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    order = "desc", // asc | desc
  } = req.query || {};

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200); // max 200
  const sortField = String(sortBy || "createdAt");
  const sortOrder = String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

  const options = {
    search: q ? String(q).trim() : undefined,
    filters: {
      category: category ? String(category).trim() : undefined,
      is_active:
        typeof is_active !== "undefined" ? is_active === "true" : undefined,
    },
    pagination: { page: pageNum, limit: limitNum },
    sort: { sortBy: sortField, order: sortOrder },
  };
  try {
    const result = await dashboardService.getAllServices(options);
    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

const getDefaultAddress = async (req, res) => {
  const userId = req.user?.id || null;
  try {
    const address = await dashboardService.getDefaultAddress(userId);
    return res.status(200).json({
      success: true,
      message: "Default address fetched successfully",
      data: address,
    });
  } catch (error) {
    console.error("Error fetching default address:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch default address" });
  }
};

const getServicesBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const services = await dashboardService.getServicesBySlug(slug);
    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services by slug",
    });
  }
};

const getSubServicesBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const subServices = await dashboardService.getSubServicesBySlug(slug);
    return res.status(200).json({
      success: true,
      data: subServices,
    });
  } catch (error) {
    console.error("Error fetching sub-services by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sub-services by slug",
    });
  }
};

//for technician
const getTechnicianAddress = async (req, res) => {
  const user_id = req.user?.id || null;
  try {
    const address = await dashboardService.getTechnicianAddress(user_id);
    return res.status(200).json({
      success: true,
      message: "Technician address fetched successfully",
      data: address,
    });
  } catch (error) {
    console.error("Error fetching technician address:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch technician address" });
  }
};

const getTechnicianDashBoard = async (req, res) => {
  const user_id = req.user?.id;
  try {
    const dashboard = await dashboardService.getTechnicianDashBoard(user_id);
    return res.status(200).json({
      success: true,
      message: "dashboard data etched sucessfully",
      data: dashboard,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// dashboard

const getDashboardStats = async (req, res) => {
  const userId = req.user?.id || null;
  try {
    const stats = await dashboardService.getDashboardStats(userId);
    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

const acceptRequest = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const data = await dashboardService.acceptRequest(id, userId);

    return res.status(200).json({
      success: true,
      message: "Request accepted successfully",
      data,
    });
  } catch (error) {
    console.error("Accept Request Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  getAllServices,
  getDefaultAddress,
  getServicesBySlug,
  getSubServicesBySlug,
  getTechnicianAddress,
  getDashboardStats,
  getTechnicianDashBoard,
  acceptRequest,
};
