const Plan = require("../models/subscriptionPlan");
const PropertyType = require("../models/propertyType");
const UserSubscription = require("../models/userSubscription");
const UserSubscriptionCustom = require("../models/userSubscriptionCustom");
const SubscriptionPlan = require("../models/subscriptionPlan");
const User = require("../models/user");
const Address = require("../models/address");
const SubscriptionVisit = require("../models/SubscriptionVisit");
const planSubService = require("../models/planSubService");
const Service = require("../models/service");
const SubService = require("../models/sub-service");
const sequelize = require("../config/db");
// const { Op } = require("sequelize");

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

  const existingSubscriptions = await UserSubscription.findAll({
    where: {
      user_id: user_id,
      status: "active",
    },
  });

  for (const sub of existingSubscriptions) {
    if (sub.id !== subscription.id) {
      await sub.update({ status: "inactive" });
    }
  }

  return subscription;
};

const createCustomSubScriptionPlan = async ({
  user_id,
  address_id,
  start_date,
  payment_option,
  end_date,
  total_price,
  service_id,
  services,
}) => {
  const t = await sequelize.transaction();

  try {
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      throw new Error("User not found");
    }

    const address = address_id
      ? await Address.findOne({ where: { id: address_id, user_id: user_id } })
      : null;

    const userSubscription = await UserSubscription.create(
      {
        user_id,
        address_id,
        start_date,
        end_date,
        price_total: total_price,
        service_id,
        payment_option,
        payment_status: "pending",
        plan_snapshot: {
          user_id,
          user_name: user.fullname,
          email: user.email,
          mobile: user.mobile,
          plan_id: service_id, // Assuming the service_id refers to the plan here
          plan_name: "Custom Plan", // Placeholder for plan name
          start_date,
          end_date,
          price_total: total_price,
          address_id: address ? address.id : null,
          address: address
            ? {
                emirate: address.emirate,
                building: address.building,
                area: address.area,
                appartment: address.appartment,
                additional_address: address.additional_address,
                category: address.category,
                save_as_address_type: address.save_as_address_type,
                location: address.location,
                latitude: address.latitude,
                longitude: address.longitude,
              }
            : null,
        },
      },
      { transaction: t }
    );

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
          snapshot: {
            service_id,
            subservice_id,
            quantity,
            unit_price,
            total_price,
          },
        },
        { transaction: t }
      );
    }

    const existingCustomSubscriptions = await UserSubscription.findAll({
      where: {
        user_id: user_id,
        status: "active",
        plan_id: null,
      },
    });
    for (const sub of existingCustomSubscriptions) {
      await sub.update({ status: "inactive" }, { transaction: t });
    }

    await t.commit();

    return userSubscription;
  } catch (error) {
    await t.rollback();
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription");
  }
};

// const getAllSubscriptionsForUser = async (userId, opts = {}) => {
//   const limit = Math.min(parseInt(opts.limit || 50, 10), 200);
//   const offset = parseInt(opts.offset || 0, 10);
//   const status = opts.status;
//   const where = { user_id: userId, status: "active"};

//   if (status) where.status = status;

//   const { count, rows } = await UserSubscription.findAndCountAll({
//     where,
//     order: [["createdAt", "DESC"]],
//     limit,
//     offset,
//     include: [
//       {
//         model: SubscriptionVisit,
//         as: "visits",
//         attributes: [
//           "subservice_id",
//           "address_id",
//           "scheduled_date",
//           "actual_date",
//           "status",
//           "visit_number",
//         ],
//         required: false,
//       },
//       {
//         model: SubscriptionPlan,
//         as: "subscription_plan",
//         attributes: ["name", "description"],
//         required: false,
//         include: [
//           {
//             model: planSubService,
//             as: "planSubServices",
//             attributes: ["subscription_plan_id", "service_id", "visit_count"],
//             include: [
//               {
//                 model: Service,
//                 as: "service",
//                 attributes: ["title", "description"],
//               },
//             ],
//           },
//         ],
//       },
//       {
//         model: UserSubscriptionCustom,
//         as: "custom_items",
//         required: false,
//         attributes: ["user_subscription_id", "quantity", "unit_price", "total_amount", ]
//       },
//     ],
//   });

//   // Process the subscription data into the desired format
//   const subscriptions = rows.map((s) => {
//     const isCustom = Array.isArray(s.custom_items) && s.custom_items.length > 0;

//     const base = {
//       id: s.id,
//       user_id: s.user_id,
//       start_date: s.start_date,
//       end_date: s.end_date,
//       status: s.status,
//       price_total: s.price_total,
//       payment_option: s.payment_option,
//       amount_per_cycle: s.amount_per_cycle,
//       payment_status: s.payment_status,
//       payment_method: s.payment_method,
//       subscriptionType: isCustom ? "custom" : "plan",
//       subscriptionPlanName: s.subscription_plan
//         ? s.subscription_plan.name
//         : null,
//       subscriptionPlanDescription: s.subscription_plan
//         ? s.subscription_plan.description
//         : null,
//     };

//     // Add custom subscription details if it exists
//     if (isCustom) {
//       base.details = {
//         items: s.custom_items.map((ci) => ({
//           id: ci.id,
//           subservice_id: ci.subservice_id,
//           quantity: ci.quantity,
//           unit_price: ci.unit_price,
//           total_amount: ci.total_amount,
//           // snapshot: ci.snapshot,
//         })),
//         // plan_snapshot: s.plan_snapshot || null,
//       };
//     }

//     // Add the SubscriptionVisits data if available
//     if (s.visits && s.visits.length > 0) {
//       base.visits = s.visits.map((visit) => ({
//         subservice_id: visit.subservice_id,
//         address_id: visit.address_id,
//         scheduled_date: visit.scheduled_date,
//         actual_date: visit.actual_date,
//         status: visit.status,
//         visit_number: visit.visit_number,
//       }));
//     } else {
//       base.visits = [];
//     }

//     return base;
//   });

//   return {
//     total: count,
//     limit,
//     offset,
//     subscriptions,
//   };
// };

const getAllSubscriptionsForUser = async (userId, opts = {}) => {
  const limit = Math.min(parseInt(opts.limit || 10), 200);
  const offset = parseInt(opts.offset || 0, 10);
  const status = opts.status;
  const where = { user_id: userId, status: "active" };

  if (status) where.status = status;

  const { count, rows } = await UserSubscription.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    include: [
      {
        model: SubscriptionVisit,
        as: "visits",
        attributes: [
          "subservice_id",
          "address_id",
          "scheduled_date",
          "actual_date",
          "status",
          "visit_number",
        ],
        required: false, // Include visits even if there are no visits (e.g., for custom subscriptions)
      },
      {
        model: SubscriptionPlan,
        as: "subscription_plan",
        attributes: ["name", "description"],
        required: false,
        include: [
          {
            model: planSubService,
            as: "planSubServices",
            attributes: ["subscription_plan_id", "service_id", "visit_count"],
            include: [
              {
                model: Service,
                as: "service",
                attributes: ["id", "title", "description"],
              },
            ],
          },
        ],
      },
      {
        model: UserSubscriptionCustom,
        as: "custom_items",
        required: false,
        attributes: [
          "user_subscription_id",
          "quantity",
          "unit_price",
          "total_amount",
        ],
        include: [
          {
            model: SubService,
            as: "subservice",
            attributes: [
              "id",
              "title",
              "description",
              "sub_service_visit_count",
            ],
          },
        ],
      },
    ],
  });

  // Process the subscription data into the desired format
  const subscriptions = rows.map((s) => {
    const isCustom = Array.isArray(s.custom_items) && s.custom_items.length > 0;

    const base = {
      id: s.id,
      user_id: s.user_id,
      start_date: s.start_date,
      end_date: s.end_date,
      status: s.status,
      price_total: s.price_total,
      payment_option: s.payment_option,
      amount_per_cycle: s.amount_per_cycle,
      payment_status: s.payment_status,
      payment_method: s.payment_method,
      subscriptionType: isCustom ? "custom" : "plan",
      subscriptionPlanName: s.subscription_plan
        ? s.subscription_plan.name
        : null,
      subscriptionPlanDescription: s.subscription_plan
        ? s.subscription_plan.description
        : null,
    };

    // Add custom subscription details if it exists
    if (isCustom) {
      base.details = {
        items: s.custom_items.map((ci) => ({
          id: ci.id,
          subservice_id: ci.subservice_id,
          quantity: ci.quantity,
          unit_price: ci.unit_price,
          total_amount: ci.total_amount,
        })),
      };
      base.visits = s.visits && s.visits.length > 0 ? s.visits : [];
    } else {
      // Add the SubscriptionPlan details and visits if available
      if (s.subscription_plan && s.subscription_plan.planSubServices) {
        base.visits = s.subscription_plan.planSubServices.map((ps) => {
          const service = ps.service || {};

          // Filter visits that match the service/subservice_id
          const scheduledVisits = s.visits.filter(
            (visit) => visit.subservice_id === service.id
          );

          return {
            service_name: service.title,
            service_description: service.description,
            visit_count: ps.visit_count,
            scheduled_visits: scheduledVisits,
          };
        });
      }
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
