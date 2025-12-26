const notificationService = require("../../services/notification");

const getAllNotifications = async (req, res) => {
  const user_id = req.user?.id || null;
  try {
    const results = await notificationService.getAll(user_id);
    return res.status(200).json({
      success: true,
      message: "Notfication fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const clearAllNotifications = async (req, res) => {
  const user_id = req.user?.id || null;

  try {
    const results = await notificationService.clrearNotification(user_id);
    return res.status(200).json({
      success: true,
      message: "Notfication cleared successfully",
      data: results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAllNotifications,
  clearAllNotifications,
};
