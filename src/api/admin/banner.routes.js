const express = require("express");
const router = express.Router();
const bannerController = require("../../controller/admin/banner.controller");
const { endPoints } = require("../api");
const middleware = require("../../middlewares/authMiddleware");

router.post(
  endPoints.banner.upsert,
  middleware.authMiddleware,
  bannerController.upsertBanner
);

router.get(
  endPoints.banner.getBannerBySlug,
  middleware.authMiddleware,
  bannerController.getBannerBySlug
);

router.get(
  endPoints.banner.getBannerById,
  middleware.authMiddleware,
  bannerController.getBannerById
);

router.get(
  endPoints.banner.getAllBanners,
  middleware.authMiddleware,
  bannerController.getAllBanners
);

router.delete(
  endPoints.banner.deleteBanner,
  middleware.authMiddleware,
  bannerController.deleteBanner
);
router.patch(
  endPoints.banner.statusUpdateBnner,
  middleware.authMiddleware,
  bannerController.statusUpdateBnner
);

module.exports = router;
