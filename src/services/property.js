// src/services/propertyType.js

const PropertyType = require("../models/propertyType");
const subscriptionPlan = require("../models/subscriptionPlan");
const PropertySubscription = require("../models/propertySubscription");
const { Op } = require("sequelize");
const sequelize = require("../config/db");

const propertyTypeExists = async (slug) => {
  const propertyType = await PropertyType.findOne({
    where: { slug, deletedAt: { [Op.is]: null } },
  });
  return propertyType;
};

const upsertPropertyWithSubscription = async (
  slug,
  propertyData,
  subscriptionsWithPrices
) => {
  console.log(
    "Incoming Data from Controller:",
    slug,
    propertyData,
    subscriptionsWithPrices
  );

  const transaction = await sequelize.transaction();
  console.log("Transaction started:", transaction);

  try {
    // Step 2: Check if the Property Type exists
    console.log("Checking if property exists...");
    const existingPropertyType = await propertyTypeExists(slug);
    console.log("Existing Property Type:", existingPropertyType);

    let propertyType;

    if (existingPropertyType) {
      console.log("Updating existing property...");
      propertyType = await existingPropertyType.update(propertyData, {
        transaction,
      });
      console.log("Updated Property:", propertyType);
    } else {
      console.log("Creating new property...");
      propertyType = await PropertyType.create(propertyData, { transaction });
      console.log("Created Property:", propertyType);
    }

    console.log("Inserting subscriptions...");
    for (let i = 0; i < subscriptionsWithPrices.length; i++) {
      const { subscription_plan_id, price } = subscriptionsWithPrices[i];
      console.log(
        `Processing subscription ${i + 1}: subscription_plan_id = ${subscription_plan_id}, price = ${price}`
      );

      if (!subscription_plan_id || price === undefined) {
        throw new Error(
          `Invalid subscription data provided for subscription ${i + 1}`
        );
      }

      const propertySubscription = await PropertySubscription.create(
        {
          property_type_id: propertyType.id,
          subscription_plan_id,
          price,
          is_active: true,
        },
        { transaction }
      );
      console.log(`Subscription ${i + 1} inserted:`, propertySubscription);
    }

    console.log("Committing transaction...");
    await transaction.commit();
    console.log("Transaction committed successfully.");

    return { propertyType, created: !existingPropertyType };
  } catch (error) {
    console.error("Error during transaction:", error);
    await transaction.rollback();
    console.log("Transaction rolled back.");
    throw error;
  }
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
    attributes: ["id", "name", "slug", "category", "description", "is_active"],
    include: [
      {
        model: PropertySubscription,
        as: "propertySubscriptions",
        attributes: ["property_type_id", "subscription_plan_id", "price"],
      },
    ],
  });

  // Flatten the Sequelize instance
  if (propertyType) {
    return propertyType.get({ plain: true }); // Convert to plain object
  }

  return null;
};

const getAllProperties = async () => {
  const properties = await PropertyType.findAll({
    where: { deletedAt: { [Op.is]: null } },
    attributes: ["id", "name", "slug", "category", "description", "is_active"],
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

const getAllPropertyByPlan = async (planId) => {
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
        attributes: ["id", "name"],
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
      price: propertysub.price,
      propertyId: propertysub.propertyType ? propertysub.propertyType.id : null,
    };
  });

  console.log("Mapped Properties:", properties);

  return properties;
};

module.exports = {
  upsertPropertyWithSubscription,
  getPropertyBySlugOrId,
  getAllProperties,
  updateStatus,
  deleteProperty,
  getAllPropertyByPlan,
};
