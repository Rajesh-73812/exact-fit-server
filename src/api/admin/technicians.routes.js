const express = require('express');
const router = express.Router();
const technicianController = require('../../controller/admin/technician.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const upload = require('../../utils/multer');

// ✅ Create or Update Technician (with optional profile image upload)
router.post(
  "/upsert-technician",
//   authMiddleware.authMiddleware,
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
  ]),
  technicianController.upsertTechnician
);

router.get("/get-all",technicianController.getAllTechnicians)
router.get("/:id",technicianController.getTechnicianByIdController)
router.put('/:id/toggle-status', technicianController.updateTechnicianToggleStatus);
router.delete('/:id', technicianController.deleteTechnician);


module.exports = router;