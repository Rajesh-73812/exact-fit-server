const router = require("express").Router();
const middleware = require("../../middlewares/authMiddleware");
const contactUsController = require("../../controller/admin/contactus");
const { endPoints } = require("../api");

router.get(
  endPoints["contact-us"].getAllContacts,
  middleware.authMiddleware,
  contactUsController.getAllContacts
);
router.get(
  endPoints["contact-us"].viewContacts,
  middleware.authMiddleware,
  contactUsController.viewContacts
);

module.exports = router;
