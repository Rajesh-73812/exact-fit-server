const { Op } = require("sequelize");
const subscriptionPlan = require("../models/subscriptionPlan");
// const User = require("../models/user");
const Service = require("../models/service");
const PlanService = require("../models/planSubService");
const sequelize = require("../config/db");

const upsertPlan = async (payload, { created_by }) => {
  const {
    name,
    category,
    slug,
    old_slug,
    base_price,
    duration_in_days = 365,
    stars,
    description,
    is_active = true,
    plan_services = [],
  } = payload;

  let planId;

  return await sequelize.transaction(async (t) => {
    let plan;

    if (old_slug) {
      // UPDATE
      plan = await subscriptionPlan.findOne({
        where: { slug: old_slug },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!plan) throw new Error("Plan not found");

      const slugTaken = await subscriptionPlan.count({
        where: { slug, id: { [Op.ne]: plan.id } },
        transaction: t,
      });
      if (slugTaken) throw new Error(`Slug "${slug}" is already taken`);

      await plan.update(
        {
          name: name.trim(),
          slug,
          category,
          base_price,
          duration_in_days,
          stars: stars || null,
          description: description || null,
          is_active,
        },
        { transaction: t }
      );

      planId = plan.id;
    } else {
      // CREATE
      const slugTaken = await subscriptionPlan.count({
        where: { slug },
        transaction: t,
      });
      if (slugTaken) throw new Error(`Slug "${slug}" already exists`);

      plan = await subscriptionPlan.create(
        {
          created_by,
          name: name.trim(),
          slug,
          category,
          base_price,
          duration_in_days,
          stars: stars || null,
          description: description || null,
          is_active,
        },
        { transaction: t }
      );

      planId = plan.id;
    }

    // Handle plan_services (pivot)
    const serviceIds = plan_services.map((ps) => ps.service_id);

    if (serviceIds.length > 0) {
      const found = await Service.findAll({
        where: { id: serviceIds },
        attributes: ["id"],
        transaction: t,
      });

      const foundSet = new Set(found.map((s) => s.id));
      const missing = serviceIds.filter((id) => !foundSet.has(id));
      if (missing.length > 0)
        throw new Error(`Services not found: ${missing.join(", ")}`);
    }

    // Existing pivots
    const existing = await PlanService.findAll({
      where: { subscription_plan_id: planId },
      paranoid: false,
      transaction: t,
    });

    const existingMap = new Map(existing.map((p) => [p.service_id, p]));
    const keepIds = new Set();

    for (const ps of plan_services) {
      let pivot = existingMap.get(ps.service_id);

      if (pivot) {
        if (pivot.deletedAt) await pivot.restore({ transaction: t });
        if (pivot.visit_count !== ps.visit_count) {
          await pivot.update(
            { visit_count: ps.visit_count },
            { transaction: t }
          );
        }
      } else {
        await PlanService.create(
          {
            subscription_plan_id: planId,
            service_id: ps.service_id,
            visit_count: ps.visit_count,
          },
          { transaction: t }
        );
      }

      keepIds.add(ps.service_id);
    }

    // Soft-delete removed
    const toDelete = existing.filter(
      (p) => !keepIds.has(p.service_id) && !p.deletedAt
    );
    if (toDelete.length > 0) {
      await PlanService.destroy({
        where: { id: toDelete.map((p) => p.id) },
        transaction: t,
      });
    }

    // Return fresh plan
    return await subscriptionPlan.findByPk(planId, {
      include: [
        {
          model: PlanService,
          as: "planSubServices",
          // where: { deletedAt: null },
          required: false,
          // include: [{ model: Service, attributes: ["id", "title"] }],
        },
      ],
      transaction: t,
    });
  });
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

const getAllPlan = async ({ filter, search, page = 1, limit = 10 }) => {
  const where = {};
  if (filter && filter !== "all") {
    where.category = filter;
  }

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
      // "scheduled_visits_count",
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
  // user_id,
  category,
  search,
  page,
  limit,
}) => {
  const where = {};
  // const user = await User.findByPk(user_id);
  // if (!user) {
  //   throw new Error("User not found");
  // }

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
      // "scheduled_visits_count",
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
    const plan = await subscriptionPlan.findOne({
      where: { slug },
      include: {
        model: PlanService,
        as: "planSubServices",
        // where: { deletedAt: null },
        required: false,
        attributes: ["id", "service_id", "visit_count"],
        include: [
          { model: Service, as: "service", attributes: ["id", "title"] },
        ],
      },
    });
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
  upsertPlan,
  toggleStatus,
  deleteBySlug,
  getAllPlan,
  getPlanBySlug,
  getAllPlanFetchByUser,
};
