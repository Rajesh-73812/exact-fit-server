const CategoryService = require("../../services/category");

const upsertCategory = async (req, res) => {
  const created_by = req.user ? req.user.id : null;
  const {
    category_slug,
    title,
    position,
    description,
    image_url,
    status,
    external_link,
  } = req.body;

  try {
    const existingCategory = await CategoryService.categoryExists(
      title,
      category_slug
    );
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: `${title} already exists!` });
    }

    const categoryData = {
      title,
      position,
      description,
      image_url,
      status,
      external_link,
      created_by: created_by,
    };

    const { category, created } = await CategoryService.upsertCategory(
      category_slug,
      categoryData
    );
    if (created) {
      return res.status(201).json({
        success: true,
        message: `Category "${category.title}" created successfully.`,
        data: category,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Category "${category.title}" updated successfully.`,
        data: category,
      });
    }
  } catch (error) {
    console.error("Error in upsertCategory controller:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "A category with this slug or title already exists.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getAllCategory = async (req, res) => {
  const user_id = req.user?.id;
  if (user_id) {
    console.log(user_id);
  }

  const { search, page, limit } = req.query;
  try {
    const pageNum = page ? parseInt(page) : 1;
    const LimitNum = limit ? parseInt(limit) : 10;
    const category = await CategoryService.getAllCategory({
      search,
      page: pageNum,
      limit: LimitNum,
    });

    return res.status(200).json({
      success: true,
      message: "Category fetched sucessfully!",
      data: category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

const updateCategoryByStatus = async (req, res) => {
  const user_id = req.user?.id;
  console.log(user_id);
  const { category_slug } = req.params;
  if (!category_slug) {
    return res.status(400).json({
      success: false,
      message: "Category slug is required.",
    });
  }

  try {
    const existingCategory = await CategoryService.categoryExists(
      category_slug,
      "update-status"
    );
    return res.status(200).json({
      success: true,
      message: "Category updated sucessfully",
      data: existingCategory,
    });
  } catch (error) {
    console.error("Error updating category status:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

const deleteCategory = async (req, res) => {
  const { category_slug } = req.params;
  if (!category_slug) {
    return res.status(400).json({
      success: false,
      message: "Category slug is required.",
    });
  }

  try {
    const categoryExists = await CategoryService.categoryExists(
      category_slug,
      "delete-category"
    );
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found. Please check the category slug and try again.",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

const getCategoryBySlug = async (req, res) => {
  const { category_slug } = req.params;
  if (!category_slug) {
    return res.status(400).json({
      success: false,
      message: "Category slug is required.",
    });
  }

  try {
    const category = await CategoryService.categoryExists(
      category_slug,
      "by-slug"
    );
    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found. Please check the category slug and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully.",
      data: category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

module.exports = {
  upsertCategory,
  getAllCategory,
  updateCategoryByStatus,
  deleteCategory,
  getCategoryBySlug,
};
