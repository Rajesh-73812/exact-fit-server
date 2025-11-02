const { endPoints } = require("../api");
const router = require("express").Router();
const admin = require("../../controller/admin/auth");

router.post(endPoints.admin.register, admin.register);
router.post(endPoints.admin.login, admin.login);
router.post(endPoints.admin.forgotPassword, admin.forgotPassword);

module.exports = router;
