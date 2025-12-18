// src/services/propertyType.js

const PropertyType = require("../models/propertyType");
const subscriptionPlan = require("../models/subscriptionPlan");
const SubscriptionPlan = require("../models/subscriptionPlan");
const PropertySubscription = require("../models/propertySubscription");
const User = require("../models/user");
const Address = require("../models/address");
const { Op } = require("sequelize");
const sequelize = require("../config/db");

// const propertyTypeExists = async (slug) => {
//   const propertyType = await PropertyType.findOne({
//     where: { slug, deletedAt: { [Op.is]: null } },
//   });
//   return propertyType;
// };

const findBySlug = async (slug) => {
  return PropertyType.findOne({ where: { slug: slug } });
};

const upsertPropertyWithSubscription = async (
  payload,
  { id = null, created_by = null } = {}
) => {
  const {
    name,
    slug,
    description,
    is_active = true,
    subscriptions = [],
  } = payload;

  // Normalize subscriptions: remove duplicates by subscription_plan_id
  const subscriptionMap = new Map();
  for (const sub of subscriptions) {
    if (sub?.subscription_plan_id) {
      subscriptionMap.set(sub.subscription_plan_id, {
        subscription_plan_id: sub.subscription_plan_id,
        commercial_price: sub.commercial_price ?? null,
        residential_price: sub.residential_price ?? null,
      });
    }
  }

  const normalizedSubscriptions = Array.from(subscriptionMap.values());
  const planIds = normalizedSubscriptions.map((s) => s.subscription_plan_id);

  let propertyTypeId;

  await sequelize.transaction(async (t) => {
    let propertyType;

    // CREATE or UPDATE PropertyType
    if (id) {
      propertyType = await PropertyType.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!propertyType) throw new Error("PropertyType not found");

      await propertyType.update(
        { name, slug, description, is_active },
        { transaction: t }
      );
    } else {
      propertyType = await PropertyType.create(
        { created_by, name, slug, description, is_active },
        { transaction: t }
      );
    }

    propertyTypeId = propertyType.id;

    // Validate all subscription plans exist
    if (planIds.length > 0) {
      const existingPlans = await SubscriptionPlan.findAll({
        where: { id: planIds },
        attributes: ["id"],
        transaction: t,
      });

      const foundIds = new Set(existingPlans.map((p) => p.id));
      const missingIds = planIds.filter((pid) => !foundIds.has(pid));

      if (missingIds.length > 0) {
        throw new Error(
          `Subscription plans not found: ${missingIds.join(", ")}`
        );
      }
    }

    // Fetch all existing pivot rows (including soft-deleted)
    const existingPivots = await PropertySubscription.findAll({
      where: { property_type_id: propertyTypeId },
      paranoid: false,
      transaction: t,
    });

    const existingMap = new Map(
      existingPivots.map((p) => [p.subscription_plan_id, p])
    );
    const keepPlanIds = new Set();

    // Upsert pivot rows
    for (const sub of normalizedSubscriptions) {
      let pivot = existingMap.get(sub.subscription_plan_id);

      if (pivot) {
        // Restore if soft-deleted
        if (pivot.deletedAt) {
          await pivot.restore({ transaction: t });
        }

        // Update prices only if changed
        const needsUpdate =
          pivot.commercial_price !== sub.commercial_price ||
          pivot.residential_price !== sub.residential_price;

        if (needsUpdate) {
          await pivot.update(
            {
              commercial_price: sub.commercial_price,
              residential_price: sub.residential_price,
            },
            { transaction: t }
          );
        }
      } else {
        // Create new pivot
        pivot = await PropertySubscription.create(
          {
            property_type_id: propertyTypeId,
            subscription_plan_id: sub.subscription_plan_id,
            commercial_price: sub.commercial_price,
            residential_price: sub.residential_price,
          },
          { transaction: t }
        );
      }

      keepPlanIds.add(sub.subscription_plan_id);
    }

    // Soft-delete removed subscriptions
    const toSoftDelete = existingPivots.filter(
      (p) => !keepPlanIds.has(p.subscription_plan_id) && p.deletedAt === null
    );

    if (toSoftDelete.length > 0) {
      const ids = toSoftDelete.map((p) => p.id);
      await PropertySubscription.destroy({
        where: { id: ids },
        transaction: t,
      });
    }
  }); // transaction auto-commits

  // Return fresh data with active subscriptions only
  return await PropertyType.findByPk(propertyTypeId, {
    include: [
      {
        model: PropertySubscription,
        as: "propertySubscriptions",
        where: { deletedAt: null },
        required: false,
        // include: [{ model: SubscriptionPlan, as: "subscription_plan" }], // uncomment if needed
      },
    ],
  });
};

const getPropertyBySlugOrId = async (slug) => {
  const whereClause = {
    deletedAt: { [Op.is]: null },
  };

  if (slug) {
    whereClause.slug = slug;
  }

  const propertyType = await PropertyType.findOne({
    where: whereClause,
    attributes: ["id", "name", "slug", "description", "is_active"],
    include: [
      {
        model: PropertySubscription,
        as: "propertySubscriptions",
        attributes: [
          "property_type_id",
          "subscription_plan_id",
          "residential_price",
          "commercial_price",
        ],
      },
    ],
  });

  if (propertyType) {
    return propertyType.get({ plain: true });
  }

  return null;
};

const getAllProperties = async () => {
  const properties = await PropertyType.findAll({
    where: { deletedAt: { [Op.is]: null } },
    attributes: ["id", "name", "slug", "description", "is_active"],
  });
  return properties;
};

const updateStatus = async (slug) => {
  const propertyType = await PropertyType.findOne({
    where: { slug, deletedAt: { [Op.is]: null } },
  });

  if (!propertyType) {
    return null;
  }

  propertyType.is_active = !propertyType.is_active;
  await propertyType.save();
  return propertyType;
};

const deleteProperty = async (slug) => {
  const propertyType = await PropertyType.findOne({
    where: { slug, deletedAt: { [Op.is]: null } },
  });

  if (!propertyType) {
    return null;
  }

  await propertyType.destroy();
  return propertyType;
};

// for user

const getAllPropertyByPlan = async (user_id, planId) => {
  const where = {};
  const user = await User.findByPk(user_id);
  if (!user) {
    throw new Error("User not found");
  }

  const userAddress = await Address.findOne({
    where: {
      user_id: user_id,
      is_default: true,
    },
  });

  if (!userAddress) {
    throw new Error("User's default address not found");
  }

  // const userCategory = userAddress.category;
  // if (userCategory) {
  //   where.category = userCategory;
  // }
  const subscriptionExists = await subscriptionPlan.findByPk(planId);
  if (!subscriptionExists) {
    console.log("Subscription plan not found!");
    return { success: false, message: "subscription not found" };
  }

  console.log(`Subscription plan found: ${subscriptionExists.name}`);

  const propertySubscriptions = await PropertySubscription.findAll({
    where: { subscription_plan_id: planId },
    include: [
      {
        model: PropertyType,
        as: "propertyType",
        where,
        attributes: ["id", "name"],
        include: [
          {
            model: PropertySubscription,
            as: "propertySubscriptions",
            attributes: ["commercial_price", "residential_price"],
          },
        ],
      },
    ],
  });

  if (!propertySubscriptions || propertySubscriptions.length === 0) {
    console.log("No property subscriptions found for the given plan ID");
    return { success: false, message: "No properties found for this plan." };
  }

  console.log(`Found ${propertySubscriptions.length} property subscriptions.`);

  const properties = propertySubscriptions.map((propertysub) => {
    console.log("Property Subscription:", propertysub);

    if (propertysub.propertyType) {
      console.log("Property Type Name:", propertysub.propertyType.name);
    } else {
      console.log("No property type found for this subscription");
    }

    return {
      propertyName: propertysub.propertyType
        ? propertysub.propertyType.name
        : null,
      propertyId: propertysub.propertyType ? propertysub.propertyType.id : null,
      commercialPrice: propertysub.commercial_price || null,
      residentialPrice: propertysub.residential_price || null,
    };
  });

  console.log("Mapped Properties:", properties);

  return properties;
};

module.exports = {
  findBySlug,
  upsertPropertyWithSubscription,
  getPropertyBySlugOrId,
  getAllProperties,
  updateStatus,
  deleteProperty,
  getAllPropertyByPlan,
};
