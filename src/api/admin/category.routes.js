const { endPoints } = require("../api");

const router = require("express").Router();
const categoryController = require("../../controller/admin/category");
const middleware = require("../../middlewares/authMiddleware");

router.post(
  endPoints.category.upsert,
  middleware.authMiddleware,
  categoryController.upsertCategory
);
router.get(
  endPoints.category.getAll,
  middleware.authMiddleware,
  categoryController.getAllCategory
);
router.get(
  endPoints.category.getCategoryBySlug,
  middleware.authMiddleware,
  categoryController.getCategoryBySlug
);
router.patch(
  endPoints.category.statusUpdate,
  middleware.authMiddleware,
  categoryController.updateCategoryByStatus
);
router.delete(
  endPoints.category.deleteCategoryBySlug,
  middleware.authMiddleware,
  categoryController.deleteCategory
);

module.exports = router;
