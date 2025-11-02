const { Op } = require("sequelize");
const Category = require("../models/category");

const categoryExists = async (category_slug, from = null) => {
  console.log(from, "frommmmmmmmm9999");
  if (category_slug && from === null) {
    const count = await Category.count({
      where: { category_slug: category_slug },
    });
    return count > 0;
  }

  if (from === "update-status") {
    const category = await Category.findOne({ where: { category_slug } });

    if (!category) {
      return null;
    }

    const updatedStatus = category.status === "active" ? "inactive" : "active";
    category.status = updatedStatus;
    await category.save();

    return {
      category_slug: category.category_slug,
      status: category.status,
    };
  }

  if (from === "delete-category") {
    const category = await Category.findOne({ where: { category_slug } });
    if (!category) {
      return null;
    }
    category.destroy();
    return true;
  }

  if (from === "by-slug") {
    console.log(category_slug, "category_slugcategory_slugcategory_slug");
    const category = await Category.findOne({
      where: { category_slug },
      attributes: [
        "title",
        "category_slug",
        "position",
        "description",
        "image_url",
        "status",
        "external_link",
      ],
    });
    if (!category) {
      return null;
    }
    return category;
  }
};

const upsertCategory = async (category_slug, categoryData) => {
  const existingCategory = await Category.findOne({
    where: { category_slug: category_slug },
    attributes: ["id", "title", "category_slug", "status"],
  });

  if (existingCategory) {
    await existingCategory.update(categoryData);

    return {
      category: {
        title: existingCategory.title,
        category_slug: existingCategory.category_slug,
        status: existingCategory.status,
      },
      created: false,
    };
  } else {
    const category = await Category.create(categoryData);

    return {
      category: {
        title: category.title,
        category_slug: category.category_slug,
        status: category.status,
      },
      created: true,
    };
  }
};

const getAllCategory = async ({ search, position, page = 1, limit = 10 }) => {
  const where = {};
  if (search) {
    where.title = { [Op.like]: `%${search}%` };
    // where.category_slug = { [Op.like]: `%${search}%` };
  }

  if (position) {
    where.position = position;
  }

  const offset = (page - 1) * limit;
  const categories = await Category.findAll({
    where,
    attributes: ["title", "category_slug", "status", "position"],
    order: [
      ["position", "ASC"],
      ["updatedAt", "DESC"],
    ],
    limit,
    offset,
  });
  return categories;
};

module.exports = {
  categoryExists,
  upsertCategory,
  getAllCategory,
};
