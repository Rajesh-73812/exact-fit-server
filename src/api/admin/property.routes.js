const router = require("express").Router();
const propertyController = require("../../controller/admin/property");
const { endPoints } = require("../api");
const middleware = require("../../middlewares/authMiddleware");

router.post(
  endPoints["property-type"].upsertProperty,
  middleware.authMiddleware,
  propertyController.upsertProperty
);
router.get(
  endPoints["property-type"].getPropertyBySlug,
  middleware.authMiddleware,
  propertyController.getPropertyBySlug
);
router.get(
  endPoints["property-type"].getAllProperty,
  middleware.authMiddleware,
  propertyController.getAllProperty
);
router.patch(
  endPoints["property-type"].updateStatusProperty,
  middleware.authMiddleware,
  propertyController.updateStatusProperty
);
router.delete(
  endPoints["property-type"].deleteProperty,
  middleware.authMiddleware,
  propertyController.deleteProperty
);

module.exports = router;
