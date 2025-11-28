const { Op } = require("sequelize");
const bannerService = require("../../services/banner.service");

const fetchAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", banner_type } = req.query;
    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    const offset = (pageNumber - 1) * pageLimit;
    const filters = { is_active: true };

    if (banner_type) {
      filters.banner_type = banner_type;
    }

    if (search && search.trim() !== "") {
      filters[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await bannerService.getAllBanners({
      where: filters,
      limit: pageLimit,
      offset,
      order: [
        ["priority", "DESC", ""],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      message: "Banners fetched successfully.",
      data: {
        total: count,
        page: pageNumber,
        limit: pageLimit,
        data: rows,
      },
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
