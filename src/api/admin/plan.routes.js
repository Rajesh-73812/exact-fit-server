const router = require("express").Router();
const planController = require("../../controller/admin/plan");
const middleware = require("../../middlewares/authMiddleware");
const { endPoints } = require("../api");

router.post(
  endPoints.plan.upsertPlan,
  middleware.authMiddleware,
  planController.upsertPlan
);
router.get(
  endPoints.plan.getAllPlan,
  middleware.authMiddleware,
  planController.getAllPlan
);
router.get(
  endPoints.plan.getPlanByBySlug,
  middleware.authMiddleware,
  planController.getPlanBySlug
);
router.patch(
  endPoints.plan.statusUpdate,
  middleware.authMiddleware,
  planController.updatePlanStaus
);
router.delete(
  endPoints.plan.deletePlanBySlug,
  middleware.authMiddleware,
  planController.deletePlan
);

module.exports = router;
