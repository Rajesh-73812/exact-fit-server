const bookingService = require("../../services/booking");

const upsertEnquiry = async (req, res) => {
  const {
    id,
    fullname,
    email,
    mobile,
    address_id,
    scope_of_work,
    specific_work_type,
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
      id,
      fullname,
      email,
      mobile,
      address_id,
      scope_of_work,
      specific_work_type,
      existing_drawing,
      plan_images,
      estimated_budget_range,
      description,
    });

    return res.status(id ? 200 : 201).json({
      success: true,
      message: "Enquiry upserted successfully.",
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
    id,
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
      id,
      fullname,
      email,
      mobile,
      service_id,
      sub_service_id,
      address_id,
      description,
    });

    return res.status(id ? 200 : 201).json({
      success: true,
      message: "Emergency upserted successfully.",
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

module.exports = {
  upsertEnquiry,
  upsertEmergency,
  getAllEnquiry,
  getAllEmergency,
};
