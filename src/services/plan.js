const { Op } = require("sequelize");
const subscriptionPlan = require("../models/subscriptionPlan");
const User = require("../models/user");
// const Address = require("../models/address");

const planService = {
  async isSlugTaken(newSlug, excludeSlug = null) {
    const where = { slug: newSlug };

    if (excludeSlug) {
      const currentPlan = await subscriptionPlan.findOne({
        where: { slug: excludeSlug },
        attributes: ["id"],
      });
      if (currentPlan) {
        where.id = { [Op.ne]: currentPlan.id };
      }
    }

    const count = await subscriptionPlan.count({ where });
    return count > 0;
  },

  async findBySlug(slug) {
    return await subscriptionPlan.findOne({ where: { slug } });
  },

  async create(planData) {
    return await subscriptionPlan.create(planData);
  },

  async update(planInstance, planData) {
    return await planInstance.update(planData);
  },
};

const toggleStatus = async (slug) => {
  const plan = await subscriptionPlan.findOne({
    where: { slug, deletedAt: { [Op.is]: null } },
  });

  if (!plan) return null;

  plan.is_active = !plan.is_active;
  await plan.save();

  return plan;
};

const deleteBySlug = async (slug) => {
  const plan = await subscriptionPlan.findOne({ where: { slug } });
  if (!plan) return null;
  await plan.destroy({ force: true });
};

const getAllPlan = async ({ search, page = 1, limit = 10 }) => {
  const where = {};
  if (search) {
    where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await subscriptionPlan.findAndCountAll({
    where,
    attributes: [
      "id",
      "name",
      "slug",
      "base_price",
      "description",
      "scheduled_visits_count",
      "duration_in_days",
      "stars",
      "is_active",
      "category",
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit);
  return {
    rows,
    count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
  };
};

const getAllPlanFetchByUser = async ({
  user_id,
  category,
  search,
  page = 1,
  limit = 10,
}) => {
  const where = {};
  const user = await User.findByPk(user_id);
  if (!user) {
    throw new Error("User not found");
  }

  // const userAddress = await Address.findOne({
  //   where: {
  //     user_id: user_id,
  //     is_default: true,
  //   },
  // });

  // if (!userAddress) {
  //   throw new Error("User's default address not found");
  // }

  // const userCategory = userAddress.category;
  // console.log(userCategory, "catttttttttttt");
  // if (userCategory) {
  //   where.category = userCategory;
  // }

  if (category) {
    where.category = category;
  }
  console.log(category, "cattt");
  if (search) {
    where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await subscriptionPlan.findAndCountAll({
    where,
    attributes: [
      "id",
      "name",
      "slug",
      "base_price",
      "description",
      "scheduled_visits_count",
      "duration_in_days",
      "stars",
      "is_active",
      "category",
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit);
  return {
    rows,
    count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
  };
};

const getPlanBySlug = async (slug) => {
  try {
    const plan = await subscriptionPlan.findOne({ where: { slug } });
    if (!plan) {
      return null;
    }
    return plan;
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    throw new Error("Could not fetch subscription plan");
  }
};

module.exports = {
  planService,
  toggleStatus,
  deleteBySlug,
  getAllPlan,
  getPlanBySlug,
  getAllPlanFetchByUser,
};
