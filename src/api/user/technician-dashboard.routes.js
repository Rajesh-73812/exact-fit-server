const router = require("express").Router();
const techDashboardController = require("../../controller/user/dashboard");
const middleware = require("../../middlewares/authMiddleware");
const { endPoints } = require("../api");

router.get(
  endPoints["technician-dashboard"].dashboard,
  middleware.authMiddleware,
  techDashboardController.getTechnicianDashBoard
);
module.exports = router;
