const { Op } = require("sequelize");
const subscriptionPlan = require("../models/subscriptionPlan");

const planExists = async (slug, currentSlug = null) => {
  if (!slug) return false;
  const where = { slug };

  if (currentSlug) {
    const existingRecord = await subscriptionPlan.findOne({
      where: { slug: currentSlug },
      attributes: ["id"],
    });

    if (existingRecord) {
      where.id = { [Op.ne]: existingRecord.id };
    }
  }

  const count = await subscriptionPlan.count({ where });
  return count > 0;
};

const upsertPlan = async (lookupSlug, planData) => {
  const existing = await subscriptionPlan.findOne({
    where: { slug: lookupSlug },
  });

  if (existing) {
    await existing.update(planData);
    return { plan: existing, created: false };
  }

  const plan = await subscriptionPlan.create(planData);
  return { plan, created: true };
};

const toggleStatus = async (slug) => {
  const plan = await subscriptionPlan.findOne({ where: { slug } });
  if (!plan) return null;

  plan.status = plan.status === "active" ? "inactive" : "active";
  await plan.save();
  return plan;
};

const deleteBySlug = async (slug) => {
  const plan = await subscriptionPlan.findOne({ where: { slug } });
  if (!plan) return null;
  await plan.destroy();
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
      "name",
      "slug",
      "base_price",
      "description",
      "scheduled_visits_count",
      "duration_in_days",
      "stars",
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
  planExists,
  upsertPlan,
  toggleStatus,
  deleteBySlug,
  getAllPlan,
  getPlanBySlug,
};
