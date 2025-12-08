const { endPoints } = require("../api");
const router = require("express").Router();
const admin = require("../../controller/admin/auth");
const middleware = require("../../middlewares/authMiddleware");

router.post(endPoints.admin.register, admin.register);
router.post(endPoints.admin.login, admin.login);
router.post(endPoints.admin.forgotPassword, admin.forgotPassword);

router.get(
  endPoints.admin.getAllCustomers,
  middleware.authMiddleware,
  admin.getAllCustomers
);
router.get(
  endPoints.admin.getCustomerById,
  middleware.authMiddleware,
  admin.customerDetailsById
);
router.patch(
  endPoints.admin.updateStatus,
  middleware.authMiddleware,
  admin.updateStatus
);

router.post(
  endPoints.admin.sentNotification,
  middleware.authMiddleware,
  admin.sentNotification
);
module.exports = router;
