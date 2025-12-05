const router = require("express").Router();
const settingsController = require("../../controller/admin/settings");
const middleware = require("../../middlewares/authMiddleware");
const { endPoints } = require("../api");

router.post(
  endPoints.settings.upsertSettings,
  middleware.authMiddleware,
  settingsController.upsertSettings
);
router.get(
  endPoints.settings.getSettings,
  middleware.authMiddleware,
  settingsController.getSettings
);

module.exports = router;
