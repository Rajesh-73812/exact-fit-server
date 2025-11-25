const router = require("express").Router();
const userSubScriptionController = require("../../controller/user/userSubscription");
const { endPoints } = require("../api");
const middleware = require("../../middlewares/authMiddleware");

router.post(
  endPoints["user-subscription"].createSubscription,
  middleware.authMiddleware,
  userSubScriptionController.createSubScriptionPlan
);

module.exports = router;
