const express = require("express");
const router = express.Router();
const bannerController = require("../../controller/user/banner");

router.get("/", bannerController.fetchAllBanners);

module.exports = router;
