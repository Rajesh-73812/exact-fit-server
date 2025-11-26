const Plan = require("../models/subscriptionPlan");
const PropertyType = require("../models/propertyType");
const UserSubscription = require("../models/userSubscription");
const UserSubscriptionCustom = require("../models/userSubscriptionCustom");
const User = require("../models/user");
const Address = require("../models/address");
const sequelize = require("../config/db");

const createSubscription = async (data) => {
  const {
    user_id,
    plan_id,
    property_type_id,
    address_id,
    start_date,
    end_date,
    price_total,
    payment_option,
  } = data;

  const plan = await Plan.findOne({ where: { id: plan_id } });
  if (!plan) {
    throw new Error("Plan not found");
  }

  const propertyType = property_type_id
    ? await PropertyType.findOne({ where: { id: property_type_id } })
    : null;

  const user = await User.findOne({ where: { id: user_id } });
  if (!user) {
    throw new Error("User not found");
  }

  const address = address_id
    ? await Address.findOne({ where: { id: address_id, user_id: user_id } })
    : null;

  const planSnapshot = {
    user_id: user.id,
    user_name: user.fullname,
    plan_id: plan.id,
    plan_name: plan.name,
    property_type_id: propertyType ? propertyType.id : null,
    property_type_name: propertyType ? propertyType.name : null,
    start_date: start_date,
    end_date: end_date,
    price: price_total,
    address_id: address ? address.id : null,
    address: address
      ? {
          emirate: address.emirate,
          building: address.building,
          area: address.area,
          appartment: address.appartment,
          additional_address: address.addtional_address,
          category: address.category,
          save_as_address_type: address.save_as_address_type,
          location: address.location,
          latitude: address.latitude,
          longitude: address.longitude,
        }
      : null,
  };

  console.log(planSnapshot, "snapshotttt");
  const subscription = await UserSubscription.create({
    user_id,
    plan_id,
    property_type_id,
    address_id,
    start_date,
    end_date,
    price_total,
    payment_option,
    plan_snapshot: planSnapshot,
    status: "active",
    payment_status: "pending",
  });

  return subscription;
};

const createCustomSubScriptionPlan = async ({
  user_id,
  address_id,
  start_date,
  payment_option,
  end_date,
  services,
}) => {
  const t = await sequelize.transaction();

  try {
    const userSubscription = await UserSubscription.create(
      {
        user_id,
        address_id,
        start_date,
        end_date,
        price_total: 0, // intially 0 after calculating total price will update
        payment_option,
        payment_status: "pending",
        plan_snapshot: {
          user_id,
        },
      },
      { transaction: t }
    );

    let totalSubscriptionPrice = 0; // Track the total price for the subscription

    for (const service of services) {
      const { service_id, subservice_id, quantity, unit_price } = service;
      const total_price = quantity * unit_price;

      await UserSubscriptionCustom.create(
        {
          user_subscription_id: userSubscription.id,
          service_id,
          subservice_id: subservice_id || null,
          quantity,
          unit_price,
          total_amount: total_price,
          snapshot: JSON.stringify({
            service_id,
            subservice_id,
            quantity,
            unit_price,
            total_price,
          }),
        },
        { transaction: t }
      );
      totalSubscriptionPrice += total_price;
    }

    await userSubscription.update(
      { price_total: totalSubscriptionPrice },
      { transaction: t }
    );
    await t.commit();

    return userSubscription;
  } catch (error) {
    await t.rollback();
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription");
  }
};

const getAllSubscriptionsForUser = async (userId, opts = {}) => {
  const limit = Math.min(parseInt(opts.limit || 50, 10), 200);
  const offset = parseInt(opts.offset || 0, 10);
  const status = opts.status;
  const where = { user_id: userId };
  if (status) where.status = status;

  const { count, rows } = await UserSubscription.findAndCountAll({
    where,
    order: [["createdAt", "SESC"]],
    limit,
    offset,
    include: [
      {
        model: UserSubscriptionCustom,
        as: "custom_items",
        required: false,
      },
    ],
  });

  const subscriptions = rows.map((s) => {
    const isCustom = Array.isArray(s.custom_items) && s.custom_items.length > 0;
    const base = {
      id: s.id,
      user_id: s.user_id,
      address_id: s.address_id,
      plan_id: s.plan_id,
      property_type_id: s.property_type_id,
      service_id: s.service_id,
      start_date: s.start_date,
      end_date: s.end_date,
      status: s.status,
      price_total: s.price_total,
      payment_option: s.payment_option,
      amount_per_cycle: s.amount_per_cycle,
      payment_status: s.payment_status,
      payment_method: s.payment_method,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      subscriptionType: isCustom ? "custom" : "plan",
    };

    if (isCustom) {
      base.details = {
        items: s.custom_items.map((ci) => ({
          id: ci.id,
          subservice_id: ci.subservice_id,
          quantity: ci.quantity,
          unit_price: ci.unit_price,
          total_amount: ci.total_amount,
          snapshot: ci.snapshot,
        })),
        plan_snapshot: s.plan_snapshot || null,
      };
    } else {
      base.details = {
        plan_snapshot: s.plan_snapshot || null,
      };
    }

    return base;
  });

  return {
    total: count,
    limit,
    offset,
    subscriptions,
  };
};
module.exports = {
  createSubscription,
  createCustomSubScriptionPlan,
  getAllSubscriptionsForUser,
};
