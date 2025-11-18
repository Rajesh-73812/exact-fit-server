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

router.get(
  endPoints.dashboard.getServicesBySlug,
  middleware.authMiddleware,
  dashboardController.getServicesBySlug
);
router.get(
  endPoints.dashboard.getSubServicesBySlug,
  middleware.authMiddleware,
  dashboardController.getSubServicesBySlug
);

module.exports = router;
