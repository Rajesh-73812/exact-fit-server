const { endPoints } = require("../api");
const router = require("express").Router();
const notificationController = require("../../controller/user/notification");
const middleware = require("../../middlewares/authMiddleware");

router.get(
  endPoints["u-notification"].getAllNotifications,
  middleware.authMiddleware,
  notificationController.getAllNotifications
);
router.patch(
  endPoints["u-notification"].clearAllNotifications,
  middleware.authMiddleware,
  notificationController.clearAllNotifications
);

module.exports = router;
