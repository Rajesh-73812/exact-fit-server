const { endPoints } = require("../api");
const router = require("express").Router();
const notificationController = require("../../controller/user/notification");
const middleware = require("../../middlewares/authMiddleware");

router.get(
  endPoints["u-notification"].getAllNotifications,
  middleware.authMiddleware,
  notificationController.getAllNotifications
);

module.exports = router;
