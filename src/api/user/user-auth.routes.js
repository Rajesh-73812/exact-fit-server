const { endPoints } = require("../api");
const router = require("express").Router();
const userAuthController = require("../../controller/user/user-auth");
const middleware = require("../../middlewares/authMiddleware");

router.post(endPoints.user.requestOTP, userAuthController.requestOtpLogin);
router.post(endPoints.user.verifyOTP, userAuthController.verifyOtpLogin);
router.post(endPoints.user.resendOTP, userAuthController.resendOtp);
router.patch(
  endPoints.user.profileUpdate,
  middleware.authMiddleware,
  userAuthController.updateUserProfile
);

router.get(
  endPoints.user.userDetails,
  middleware.authMiddleware,
  userAuthController.getUserDetails
);

router.post(
  endPoints.user.upsertAddress,
  middleware.authMiddleware,
  userAuthController.upsertAddress
);

router.patch(
  endPoints.user.setDefaultAddress,
  middleware.authMiddleware,
  userAuthController.setDefaultAddress
);

router.delete(
  endPoints.user.deleteAddress,
  middleware.authMiddleware,
  userAuthController.deleteAddress
);
module.exports = router;
