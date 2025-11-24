const express = require("express");
const router = express.Router();
const bannerController = require("../../controller/admin/banner.controller");
const { endPoints } = require("../api");

router.post(endPoints.banner.upsert, bannerController.upsertBanner);

router.post(endPoints.banner.getBannerBySlug, bannerController.getBannerBySlug);

router.post(endPoints.banner.getBannerById, bannerController.getBannerById);

router.post(endPoints.banner.getAllBanners, bannerController.getAllBanners);

router.post(endPoints.banner.deleteBanner, bannerController.deleteBanner);
module.exports = router;
