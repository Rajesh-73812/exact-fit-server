const router = require("express").Router();
const technicianController = require("../../controller/admin/technician.controller");
const authMiddleware = require("../../middlewares/authMiddleware");
const { endPoints } = require("../api");

router.post(
  endPoints["a-technician"].upsertTechnician,
  authMiddleware.authMiddleware,
  technicianController.upsertTechnician
);
router.get(
  endPoints["a-technician"].getAllTechnician,
  authMiddleware.authMiddleware,
  technicianController.getAllTechnicians
);
router.get(
  endPoints["a-technician"].getTechnicianById,
  authMiddleware.authMiddleware,
  technicianController.getTechnicianByIdController
);
router.patch(
  endPoints["a-technician"].statusUpdate,
  authMiddleware.authMiddleware,
  technicianController.updateTechnicianToggleStatus
);
router.delete(
  endPoints["a-technician"].deleteTechnician,
  authMiddleware.authMiddleware,
  technicianController.deleteTechnician
);

module.exports = router;
