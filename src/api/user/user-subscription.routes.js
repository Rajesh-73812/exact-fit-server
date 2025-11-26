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

//shown subscription which subscription taken by user
router.get(
  endPoints["user-subscription"].allSubscription,
  middleware.authMiddleware,
  userSubScriptionController.getAllSubscription
);

module.exports = router;
