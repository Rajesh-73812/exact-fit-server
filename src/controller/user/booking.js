const bookingService = require("../../services/booking");

const upsertEnquiry = async (req, res) => {
  const {
    id,
    fullname,
    email,
    address_id,
    scope_of_work,
    full_fit_out,
    work_type,
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
      address_id,
      scope_of_work,
      full_fit_out,
      work_type,
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

module.exports = {
  upsertEnquiry,
};
