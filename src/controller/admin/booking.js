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

module.exports = {
  getAllSubscriptionBooking,
  getAllEnquiryBooking,
  getAllEmergencyBooking,
  getEmergencyBookingById,
  getAllEnquiryBookingById,
};
