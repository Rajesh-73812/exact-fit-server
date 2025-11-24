// src/services/propertyType.js

const PropertyType = require("../models/propertyType");
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

const getPropertyBySlug = async (slug) => {
  const propertyType = await PropertyType.findOne({
    where: { slug, deletedAt: { [Op.is]: null } },
    attributes: ["id", "name", "slug", "category", "description", "is_active"],
  });
  return propertyType;
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

module.exports = {
  upsertPropertyWithSubscription,
  getPropertyBySlug,
  getAllProperties,
  updateStatus,
  deleteProperty,
};
