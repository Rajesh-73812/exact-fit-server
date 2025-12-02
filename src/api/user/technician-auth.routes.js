const router = require("express").Router();
// const middleware = require("../../middlewares/authMiddleware");
const { endPoints } = require("../api");
const technicianAuthController = require("../../controller/user/technician-auth");

router.post(
  endPoints.user.requestOTP,
  technicianAuthController.requestOtpLogin
);
router.post(endPoints.user.verifyOTP, technicianAuthController.verifyOtpLogin);
// router.post(endPoints.user.resendOTP, technicianAuthController.resendOtp);

module.exports = router;
