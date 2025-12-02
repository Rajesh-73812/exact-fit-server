const bookingService = require("../../services/booking");

const upsertEnquiry = async (req, res) => {
  const {
    fullname,
    email,
    mobile,
    address_id,
    scope_of_work,
    existing_drawing,
    plan_images,
    estimated_budget_range,
    description,
  } = req.body;

  const user_id = req.user.id;

  try {
    if (!fullname || !email) {
      return res.status(400).json({
        success: false,
        message: "Fullname and email are required.",
      });
    }

    const result = await bookingService.upsertEnquiry(user_id, {
      fullname,
      email,
      mobile,
      address_id,
      scope_of_work,
      existing_drawing,
      plan_images,
      estimated_budget_range,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry Created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error in upsertEnquiry controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process the enquiry.",
    });
  }
};

const upsertEmergency = async (req, res) => {
  const user_id = req.user.id;
  const {
    fullname,
    email,
    mobile,
    service_id,
    sub_service_id,
    address_id,
    description,
  } = req.body;

  try {
    const result = await bookingService.upsertEmergency(user_id, {
      fullname,
      email,
      mobile,
      service_id,
      sub_service_id,
      address_id,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Emergency Created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error in upsertEmergency controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process the Emergency.",
    });
  }
};

const getAllEnquiry = async (req, res) => {
  const user_id = req.user.id;
  const { page = 1, pageSize = 10, search = "" } = req.query;
  try {
    const result = await bookingService.getAllEnquiry(
      user_id,
      page,
      pageSize,
      search
    );
    return res.status(200).json({
      success: true,
      message: "Enquiries fetched successfully",
      data: result.rows,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: pageSize,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllEmergency = async (req, res) => {
  const user_id = req.user.id;
  const { page = 1, pageSize = 10, search = "" } = req.query;
  try {
    const result = await bookingService.getAllEmergency(
      user_id,
      page,
      pageSize,
      search
    );
    return res.status(200).json({
      success: true,
      message: "Emergencies fetched successfully",
      data: result.rows,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: pageSize,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getServiceById = async (req, res) => {
  const user_id = req.user.id;
  const { type } = req.query;
  const { id } = req.params;
  try {
    const result = await bookingService.getServiceById({ user_id, id, type });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or you do not have access to this booking.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${type || "Booking"} fetched successfully.`,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  upsertEnquiry,
  upsertEmergency,
  getAllEnquiry,
  getAllEmergency,
  getServiceById,
};
