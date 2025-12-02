const bannerService = require("../../services/banner.service");

const formatDate = (dateString) => {
  if (!dateString) {
    return null;
  }
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const upsertBanner = async (req, res) => {
  try {
    const {
      id,
      name,
      slug,
      image_url,
      priority,
      link_url,
      start_date,
      end_date,
      is_active,
      banner_type,
    } = req.body;

    console.log(req.body, "from bodyyyyyyyyyyyyyyyyy");
    // Required fields
    if (!name?.trim() || !image_url) {
      return res.status(400).json({
        success: false,
        message: "Name and image are required.",
      });
    }

    const finalSlug = slug?.trim();

    if (!finalSlug) {
      return res.status(400).json({
        success: false,
        message: "Invalid slug generated from name.",
      });
    }

    // If editing (id exists) → allow same slug, just exclude current record
    // If creating → check uniqueness
    if (!id) {
      const slugExists = await bannerService.bannerExists(finalSlug);
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "A banner with this slug already exists. Try a unique name.",
        });
      }
    } else {
      // Editing: allow same slug only for this banner
      const slugExistsElsewhere = await bannerService.bannerExists(
        finalSlug,
        id
      );
      if (slugExistsElsewhere) {
        return res.status(400).json({
          success: false,
          message: "This slug is already used by another banner.",
        });
      }
    }

    const bannerData = {
      id, // only used if present (edit)
      name: name.trim(),
      slug: finalSlug,
      image_url,
      priority: priority ? Number(priority) : null,
      link_url: link_url || null,
      start_date: formatDate(start_date) || null,
      end_date: formatDate(end_date) || null,
      is_active: is_active === true || is_active === "true",
      banner_type,
    };

    const { banner, created } = await bannerService.upsertBanner(bannerData);

    return res.status(created ? 201 : 200).json({
      success: true,
      message: `Banner ${created ? "created" : "updated"} successfully!`,
      data: banner,
    });
  } catch (error) {
    console.error("Error in upsertBanner:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save banner",
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
  const { id } = req.params;

  try {
    const banner = await bannerService.getBannerBySlug(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
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
    });
  }
};

const getAllBanners = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  console.log(req.query, "from query");

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  try {
    const result = await bannerService.getAllBanners({
      search: search || undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    const { rows, count, activeCount = 0, inactiveCount = 0 } = result;

    const totalPages = Math.ceil(count / parsedLimit);

    return res.status(200).json({
      success: true,
      message: "Banners fetched successfully!",
      data: rows, // Return the actual banners data
      pagination: {
        total: count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
      },
      activeCount,
      inactiveCount,
    });
  } catch (error) {
    console.error("Error in getAllBanners:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
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

const statusUpdateBnner = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Banner id is required.",
    });
  }
  try {
    const banner = await bannerService.toggleStatus(id);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      data: banner,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  upsertBanner,
  getBannerById,
  getBannerBySlug,
  getAllBanners,
  deleteBanner,
  statusUpdateBnner,
};
