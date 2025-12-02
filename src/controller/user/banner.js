const bannerService = require("../../services/banner.service");

const fetchAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 10, banner_type } = req.query;
    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);

    const banners = await bannerService.getAllUserBanners({
      pageNumber,
      pageLimit,
      banner_type,
    });

    res.status(200).json({
      success: true,
      message: "Banners fetched successfully.",
      data: banners,
    });
  } catch (error) {
    console.error("Error in createBanner:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
      code: "BANNER_CREATE_ERROR",
    });
  }
};

module.exports = { fetchAllBanners };
