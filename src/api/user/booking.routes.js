const router = require("express").Router();
const { endPoints } = require("../api");
const bookingController = require("../../controller/user/booking");
const middleware = require("../../middlewares/authMiddleware");

router.post(
  endPoints.booking.upsertEnquiry,
  middleware.authMiddleware,
  bookingController.upsertEnquiry
);

module.exports = router;
