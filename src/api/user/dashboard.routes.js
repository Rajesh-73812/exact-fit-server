const router = require("express").Router();
const { endPoints } = require("../api");
const dashboardController = require("../../controller/user/dashboard");
const middleware = require("../../middlewares/authMiddleware");

router.get(
  endPoints.dashboard.getDefaultAddress,
  middleware.authMiddleware,
  dashboardController.getDefaultAddress
);
router.get(
  endPoints.dashboard.getAllServiceAndSubServices,
  middleware.authMiddleware,
  dashboardController.getAllServices
);

module.exports = router;
