const { endPoints } = require("../api");
const router = require("express").Router();
const serviceController = require("../../controller/admin/service");
const middleware = require("../../middlewares/authMiddleware");

router.post(
  endPoints.service.upsert,
  middleware.authMiddleware,
  serviceController.upsertService
);
router.get(
  endPoints.service.getAll,
  middleware.authMiddleware,
  serviceController.getAllService
);
router.get(
  endPoints.service.getServiceBySlug,
  middleware.authMiddleware,
  serviceController.getServiceBySlug
);
router.patch(
  endPoints.service.statusUpdate,
  middleware.authMiddleware,
  serviceController.updateServiceByStatus
);
router.delete(
  endPoints.service.deleteServiceBySlug,
  middleware.authMiddleware,
  serviceController.deleteService
);

module.exports = router;
