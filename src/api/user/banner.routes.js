const router = require("express").Router();

const bannerController = require("../../controller/user/banner");
const middleware = require("../../middlewares/authMiddleware");
const { endPoints } = require("../api");

router.get(
  endPoints["user-banner"].getAll,
  middleware.authMiddleware,
  bannerController.fetchAllBanners
);

module.exports = router;
