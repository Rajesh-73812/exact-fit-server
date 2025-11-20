const Service = require("../../services/service");

const upsertService = async (req, res) => {
  const created_by = req.user ? req.user.id : null;

  const {
    old_service_slug, // ← ADD THIS LINE (only sent from frontend during edit)
    service_slug, // ← this is the NEW slug (from current title)
    title,
    position,
    description,
    image_url,
    image_alt,
    status,
    external_link,
  } = req.body;

  console.log(req.body, "from service");

  try {
    // ← FIX: Use old slug if editing, otherwise use new slug
    const slugToSearch = old_service_slug || service_slug;

    // ← FIX: Check duplicate but ignore current record if editing
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
      service_slug: service_slug, // ← we will set this new slug
    };

    // ← FIX: Pass the slug we used to search (old or new)
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
    const pageNum = page ? parseInt(page) : 1;
    const LimitNum = limit ? parseInt(limit) : 10;
    const service = await Service.getAllService({
      search,
      page: pageNum,
      limit: LimitNum,
    });

    return res.status(200).json({
      success: true,
      message: "service fetched sucessfully!",
      data: service,
      activeserviceCount: service.activeCount,
      inactiveserviceCount: service.inactiveCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
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
