const { endPoints } = require("../api");
const router = require("express").Router();
const planController = require("../../controller/user/plan");
const middleware = require("../../middlewares/authMiddleware");

router.get(
  endPoints["user-plan"].getAllPlan,
  middleware.authMiddleware,
  planController.getAllPlan
);
router.get(
  endPoints["user-plan"].getPlanByBySlug,
  middleware.authMiddleware,
  planController.getPlanBySlug
);
module.exports = router;
