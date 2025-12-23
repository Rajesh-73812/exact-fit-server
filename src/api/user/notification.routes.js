const { endPoints } = require("../api");
const router = require("express").Router();
const notificationController = require("../../controller/user/notification");

router.get(
  endPoints["u-notification"].getAllNotifications,
  notificationController.getAllNotifications
);

module.exports = router;
