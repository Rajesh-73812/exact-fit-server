const bookingService = require("../../services/booking");

const getAllSubscriptionBooking = async (req, res) => {
  try {
    const booking = await bookingService.getAllSubscriptionBooking();
    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllEnquiryBooking = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  try {
    const booking = await bookingService.getAllEnquiryBooking({
      search,
      pageNum,
      limitNum,
    });
    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllEmergencyBooking = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  try {
    const booking = await bookingService.getAllEmergencyBooking({
      search,
      pageNum,
      limitNum,
    });
    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getEmergencyBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await bookingService.getEmergencyBookingById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllEnquiryBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await bookingService.getAllEnquiryBookingById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const viewSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Subscription ID is required",
      });
    }

    const subscription = await bookingService.getSubscriptionById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    return res.json({
      success: true,
      message: "Subscription fetched successfully",
      data: subscription,
    });
  } catch (err) {
    console.error("View subscription error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const assignTechnician = async (req, res) => {
  try {
    const { visit_id } = req.params;
    const { technician_id, scheduled_date, status } = req.body;

    // Validate visit_id
    if (!visit_id) {
      return res.status(400).json({
        success: false,
        message: "Visit ID is required",
      });
    }

    // Validate technician_id (mandatory)
    if (!technician_id) {
      return res.status(400).json({
        success: false,
        message: "technician_id is required",
      });
    }

    const result = await bookingService.assignTechnicianToVisit({
      visitId: visit_id,
      technicianId: technician_id,
      scheduledDate: scheduled_date, // optional
      status: status,                 // optional
    });

    return res.json({
      success: true,
      message: "Technician assigned successfully",
      data: result,
    });
  } catch (err) {
    console.error("Assign technician error:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to assign technician",
    });
  }
};

module.exports = {
  getAllSubscriptionBooking,
  getAllEnquiryBooking,
  getAllEmergencyBooking,
  getEmergencyBookingById,
  getAllEnquiryBookingById,
  viewSubscription,
  assignTechnician,
};
