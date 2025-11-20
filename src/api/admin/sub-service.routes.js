const { endPoints } = require("../api");
const router = require("express").Router();
const subServiceController = require("../../controller/admin/sub-service");
const middleware = require("../../middlewares/authMiddleware");

router.post(
  endPoints["sub-service"].upsert,
  middleware.authMiddleware,
  subServiceController.upsertService
);
router.get(
  endPoints["sub-service"].getAll,
  middleware.authMiddleware,
  subServiceController.getAllService
);
router.get(
  endPoints["sub-service"].getSubServiceBySlug,
  middleware.authMiddleware,
  subServiceController.getServiceBySlug
);
router.patch(
  endPoints["sub-service"].statusUpdate,
  middleware.authMiddleware,
  subServiceController.updateServiceByStatus
);
router.delete(
  endPoints["sub-service"].deleteSubServiceBySlug,
  middleware.authMiddleware,
  subServiceController.deleteService
);

module.exports = router;
