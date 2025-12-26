// const { Op } = require("sequelize");
const Notification = require("../models/notification");

const getAll = async (user_id) => {
  return await Notification.findAll({
    where: { user_id, is_read: false },
    attributes: ["title", "description", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
};

const clrearNotification = async (user_id, notification_ids) => {
  try {
    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id,
          is_read: false,
        },
      }
    );
  } catch (error) {
    console.error("Error clearing notifications:", error);
    throw new Error("Failed to clear notifications. Please try again later.");
  }
};

module.exports = {
  getAll,
  clrearNotification,
};
