const router = require("express").Router();
const bookingController = require("../../controller/admin/booking");
// const middleware = require("../../middlewares/authMiddleware");
const { endPoints } = require("../api");

router.get(
  endPoints["a-booking"].getAllEmergencyBooking,
  //   middleware.authMiddleware,
  bookingController.getAllEmergencyBooking
);
router.get(
  endPoints["a-booking"].getAllEnquiryBooking,
  //   middleware.authMiddleware,
  bookingController.getAllEnquiryBooking
);
router.get(
  endPoints["a-booking"].getAllSubscriptionBooking,
  //   middleware.authMiddleware,
  bookingController.getAllSubscriptionBooking
);

module.exports = router;
