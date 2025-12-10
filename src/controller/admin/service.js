const Service = require("../../services/service");

const upsertService = async (req, res) => {
  const created_by = req.user ? req.user.id : null;

  const {
    old_service_slug,
    service_slug,
    title,
    position,
    description,
    image_url,
    image_alt,
    status,
    external_link,
    type,
  } = req.body;

  console.log(req.body, "from service");

  try {
    const slugToSearch = old_service_slug || service_slug;

    const existingservice = await Service.ServiceExists(
      title,
      service_slug,
      slugToSearch
    );
    if (existingservice) {
      return res
        .status(400)
        .json({ success: false, message: `${title} already exists!` });
    }

    const serviceData = {
      title,
      position,
      description,
      image_url,
      image_alt,
      status,
      external_link,
      created_by: created_by,
      service_slug: service_slug,
      type,
    };

    const { service, created } = await Service.upsertService(
      slugToSearch,
      serviceData
    );

    if (created) {
      return res.status(201).json({
        success: true,
        message: `service "${service.title}" created successfully.`,
        data: service,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `service "${service.title}" updated successfully.`,
        data: service,
      });
    }
  } catch (error) {
    console.error("Error in upsertservice controller:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getAllService = async (req, res) => {
  const user_id = req.user?.id;
  if (user_id) {
    console.log(user_id);
  }

  const { search, page, limit } = req.query;
  try {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await Service.getAllService({
      search: search || undefined,
      page: pageNum,
      limit: limitNum,
    });

    const { rows, count, activeCount = 0, inactiveCount = 0 } = result;

    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      success: true,
      message: "Services fetched successfully!",
      data: rows, // ← Send only the rows, not the whole result
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      activeCount,
      inactiveCount,
    });
  } catch (error) {
    console.error("getAllService error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateServiceByStatus = async (req, res) => {
  const user_id = req.user?.id;
  console.log(user_id, "user_iddddddddddddddddddddddddddddd");
  const { service_slug } = req.params;
  if (!service_slug) {
    return res.status(400).json({
      success: false,
      message: "service slug is required.",
    });
  }

  try {
    const existingservice = await Service.ServiceExists(
      service_slug,
      "update-status"
    );
    return res.status(200).json({
      success: true,
      message: "service updated sucessfully",
      data: existingservice,
    });
  } catch (error) {
    console.error("Error updating service status:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

const deleteService = async (req, res) => {
  const { service_slug } = req.params;
  if (!service_slug) {
    return res.status(400).json({
      success: false,
      message: "service slug is required.",
    });
  }

  try {
    const serviceExists = await Service.ServiceExists(
      service_slug,
      "delete-service"
    );
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message:
          "service not found. Please check the service slug and try again.",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "service deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

const getServiceBySlug = async (req, res) => {
  const { service_slug } = req.params;
  if (!service_slug) {
    return res.status(400).json({
      success: false,
      message: "service slug is required.",
    });
  }

  try {
    const service = await Service.ServiceExists(service_slug, "by-slug");
    if (!service) {
      return res.status(404).json({
        success: false,
        message:
          "service not found. Please check the service slug and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "service fetched successfully.",
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

module.exports = {
  upsertService,
  getAllService,
  updateServiceByStatus,
  deleteService,
  getServiceBySlug,
};
