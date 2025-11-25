const { endPoints } = require("../api");
const router = require("express").Router();
const propertyController = require("../../controller/user/property");
const middleware = require("../../middlewares/authMiddleware");

router.get(
  endPoints.property.getAllProperty,
  middleware.authMiddleware,
  propertyController.getAllProperty
);

module.exports = router;
