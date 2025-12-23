const Notification = require("../models/notification");

const getAll = async (user_id) => {
  return await Notification.findOne({
    where: { user_id },
    attributes: ["title", "description"],
  });
};

module.exports = {
  getAll,
};
