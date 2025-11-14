const SubService = require("../../services/sub-service");

const upsertService = async (req, res) => {
  const created_by = req.user?.id ?? null;

  const {
    sub_service_slug,
    service_id,
    title,
    position,
    description,
    image_url,
    image_alt,
    status,
    external_link,
    discount,
    price,
    hero_banner,
  } = req.body;

  try {
    // Duplicate check: title OR slug
    const exists = await SubService.serviceExists(title, sub_service_slug);
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: `${title} already exists!` });
    }

    const serviceData = {
      title,
      sub_service_slug,
      service_id,
      position,
      description,
      image_url,
      image_alt,
      status: status ?? "active",
      external_link,
      discount,
      price,
      hero_banner,
      created_by,
    };

    const { subService, created } = await SubService.upsertService(
      sub_service_slug,
      serviceData
    );

    const action = created ? "created" : "updated";
    return res.status(created ? 201 : 200).json({
      success: true,
      message: `Service "${subService.title}" ${action} successfully.`,
      data: subService,
    });
  } catch (error) {
    console.error("upsertService error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ success: false, message: "Slug already exists." });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getAllService = async (req, res) => {
  const { search, page, limit } = req.query;
  try {
    const result = await SubService.getAllService({
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    return res.status(200).json({
      success: true,
      message: "Services fetched successfully!",
      data: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        totalPages: result.totalPages,
      },
      activeCount: result.activeCount,
      inactiveCount: result.inactiveCount,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const updateServiceByStatus = async (req, res) => {
  const { sub_service_slug } = req.params;
  if (!sub_service_slug) {
    return res
      .status(400)
      .json({ success: false, message: "sub_service_slug is required." });
  }

  try {
    const service = await SubService.toggleStatus(sub_service_slug);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      data: service,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const deleteService = async (req, res) => {
  const { service_slug } = req.params;
  if (!service_slug) {
    return res
      .status(400)
      .json({ success: false, message: "service_slug is required." });
  }

  try {
    const deleted = await SubService.deleteBySlug(service_slug);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getServiceBySlug = async (req, res) => {
  const { sub_service_slug } = req.params;
  if (!sub_service_slug) {
    return res
      .status(400)
      .json({ success: false, message: "service_slug is required." });
  }

  try {
    const service = await SubService.findBySlug(sub_service_slug);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Service fetched successfully.",
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  upsertService,
  getAllService,
  updateServiceByStatus,
  deleteService,
  getServiceBySlug,
};
