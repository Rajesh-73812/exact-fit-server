const router = require("express").Router();
const contactusController = require("../../controller/user/contactus");
const { endPoints } = require("../api");

router.post(
  endPoints.contactus.createContactus,
  contactusController.createContactus
);

module.exports = router;
