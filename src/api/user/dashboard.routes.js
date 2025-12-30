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
  // middleware.authMiddleware,
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

// for technician
router.get(
  endPoints.dashboard.getTechnicianAddress,
  middleware.authMiddleware,
  dashboardController.getTechnicianAddress
);
router.get(
  endPoints["technician-dashboard"].dashboard,
  middleware.authMiddleware,
  dashboardController.getTechnicianDashBoard
);

router.patch(
  endPoints["technician-dashboard"].Accept,
  middleware.authMiddleware,
  dashboardController.acceptRequest
);

router.get(
  endPoints["technician-dashboard"].getAllEmergencyBookings,
  middleware.authMiddleware,
  dashboardController.getAllEmergencyBookings
);

router.patch(
  endPoints["technician-dashboard"].acceptEmergencyRequest,
  middleware.authMiddleware,
  dashboardController.acceptEmergencyRequest
);

router.get(
  endPoints["technician-dashboard"].fetchScheduleServices,
  middleware.authMiddleware,
  dashboardController.fetchScheduleServices
);
module.exports = router;
