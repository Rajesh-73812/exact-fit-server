const bannerService = require("../../services/banner.service");
const slugify = require("slugify");

const upsertBanner = async (req, res) => {
  try {
    const {
      id,
      name,
      image_url,
      schedule_time,
      link_url,
      priority,
      banner_type,
    } = req.body;

    // Required fields validation
    if (!name || !image_url) {
      return res.status(400).json({
        success: false,
        message: "Name and image_url are required.",
        code: "BANNER_REQUIRED_FIELDS_MISSING",
      });
    }

    // Auto-generate slug from name
    const slug = slugify(name, { lower: true });

    let result;

    // UPDATE EXISTING BANNER
    if (id) {
      const updated = await bannerService.updateBanner(id, {
        name,
        slug,
        image_url,
        schedule_time,
        link_url,
        priority,
        banner_type,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Banner not found with provided ID.",
          code: "BANNER_NOT_FOUND",
        });
      }

      result = await bannerService.getBannerById(id);
    }

    // CREATE NEW BANNER
    else {
      result = await bannerService.createBanner({
        name,
        slug,
        image_url,
        schedule_time,
        link_url,
        priority,
        banner_type,
      });
    }

    return res.status(200).json({
      success: true,
      message: id
        ? "Banner updated successfully"
        : "Banner created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in upsertBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upsert banner",
      code: "BANNER_UPSERT_FAILED",
    });
  }
};

const getBannerById = async (req, res) => {
  const { id } = req.params;

  try {
    const banner = await bannerService.getBannerById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
        code: "BANNER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error("Error in getBannerById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
      code: "BANNER_FETCH_FAILED",
    });
  }
};

const getBannerBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const banner = await bannerService.getBannerBySlug(slug);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
        code: "BANNER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error("Error in getBannerBySlug:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch banner by slug",
      code: "BANNER_FETCH_BY_SLUG_FAILED",
    });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const banners = await bannerService.getAllBanners();
    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Error in getAllBanners:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      code: "BANNER_FETCH_FAILED",
    });
  }
};

const deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await bannerService.deleteBanner(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
        code: "BANNER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      code: "BANNER_DELETE_FAILED",
    });
  }
};

module.exports = {
  upsertBanner,
  getBannerById,
  getBannerBySlug,
  getAllBanners,
  deleteBanner,
};
