const router = require("express").Router();
const middleware = require("../../middlewares/authMiddleware");
const technicianAuthController = require("../../controller/user/technician-auth");
const { endPoints } = require("../api");
const { technician } = endPoints;

router.post(technician.requestOTP, technicianAuthController.requestOtpLogin);
router.post(technician.verifyOTP, technicianAuthController.verifyOtpLogin);
router.post(technician.resendOTP, technicianAuthController.resendOtp);

router.get(
  technician.details,
  middleware.authMiddleware,
  technicianAuthController.detailsOfTechnician
);

router.patch(
  technician.deactivateAccount,
  middleware.authMiddleware,
  technicianAuthController.technicianDeactivateAccount
);

module.exports = router;
