const router = require("express").Router();
const { endPoints } = require("../api");
const bookingController = require("../../controller/user/booking");
const middleware = require("../../middlewares/authMiddleware");

router.post(
  endPoints.booking.upsertEnquiry,
  middleware.authMiddleware,
  bookingController.upsertEnquiry
);

router.post(
  endPoints.booking.upsertEmergency,
  middleware.authMiddleware,
  bookingController.upsertEmergency
);
router.get(
  endPoints.booking.getAllEnquiry,
  middleware.authMiddleware,
  bookingController.getAllEnquiry
);
router.get(
  endPoints.booking.getAllEmergency,
  middleware.authMiddleware,
  bookingController.getAllEmergency
);

router.get(
  endPoints.booking.getEnquiryById,
  middleware.authMiddleware,
  bookingController.getServiceById
);

module.exports = router;
