const router = require("express").Router();
const userSubScriptionController = require("../../controller/user/userSubscription");
const { endPoints } = require("../api");
const middleware = require("../../middlewares/authMiddleware");

// normal subscription
router.post(
  endPoints["user-subscription"].createSubscription,
  middleware.authMiddleware,
  userSubScriptionController.createSubScriptionPlan
);

// user custom subscription
router.post(
  endPoints["user-subscription"].createCustomSubscription,
  middleware.authMiddleware,
  userSubScriptionController.createCustomSubScriptionPlan
);
module.exports = router;
