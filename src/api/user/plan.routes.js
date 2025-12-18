const { endPoints } = require("../api");
const router = require("express").Router();
const planController = require("../../controller/user/plan");
const middleware = require("../../middlewares/authMiddleware");

router.get(
  endPoints["user-plan"].getAllPlanFetchByUser,
  planController.getAllPlanFetchByUser
);

router.get(
  endPoints["user-plan"].getPlanByBySlug,
  // middleware.authMiddleware,
  planController.getPlanBySlug
);

module.exports = router;
