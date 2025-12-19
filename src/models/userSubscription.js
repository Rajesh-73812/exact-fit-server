const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const SubService = require("./sub-service");
const SubscriptionPlan = require("./subscriptionPlan");
const UserSubscriptionCustom = require("./userSubscriptionCustom");
const SubscriptionVisit = require("./SubscriptionVisit");

const UserSubscription = sequelize.define(
  "UserSubscription",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    property_type_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    plan_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "active",
        "expired",
        "cancelled",
        "pending",
        "inactive"
      ),
      defaultValue: "active",
    },
    price_total: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "Total price in smallest currency unit (e.g. fils/paise/cents).",
    },
    payment_option: {
      type: DataTypes.ENUM("monthly", "yearly"),
      allowNull: false,
      defaultValue: "yearly",
    },
    amount_per_cycle: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "If monthly, amount for each billing cycle (in smallest unit).",
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "partial", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },

    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plan_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "user_subscriptions",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = UserSubscription;

// This works on ALL Sequelize v6 versions (even buggy ones)
UserSubscription.afterCreate(async (subscription, options) => {
  // If we're inside a transaction, wait for commit
  const transaction = options.transaction;
  if (transaction) {
    transaction.afterCommit(async () => {
      await createVisits(subscription);
    });
  } else {
    // No transaction → run immediately
    await createVisits(subscription);
  }
});

// Extract the logic so we can reuse it
async function createVisits(subscription) {
  try {
    console.log("Creating visits for subscription:", subscription.id);
    const visits = [];

    if (subscription.plan_id) {
      const plan = await SubscriptionPlan.findByPk(subscription.plan_id);
      if (!plan?.scheduled_visits_count) return;

      const count = plan.scheduled_visits_count;
      const start = new Date(subscription.start_date);
      const interval = 12 / count;

      for (let i = 1; i <= count; i++) {
        const date = new Date(start);
        date.setMonth(start.getMonth() + Math.round(interval * (i - 0.5)));
        visits.push({
          user_subscription_id: subscription.id,
          subservice_id: null,
          address_id: subscription.address_id,
          scheduled_date: date.toISOString().split("T")[0],
          status: "scheduled",
          visit_number: i,
          notes: `${plan.name} - Visit ${i}/${count}`,
        });
      }
    } else {
      const customLines = await UserSubscriptionCustom.findAll({
        where: { user_subscription_id: subscription.id },
      });

      console.log("Found custom lines:", customLines.length);

      for (const line of customLines) {
        const subservice = await SubService.findByPk(line.subservice_id);
        if (!subservice?.sub_service_visit_count) continue;

        const count = subservice.sub_service_visit_count;
        const start = new Date(subscription.start_date);
        const interval = 12 / count;

        for (let i = 1; i <= count; i++) {
          const date = new Date(start);
          date.setMonth(start.getMonth() + Math.round(interval * (i - 0.5)));
          visits.push({
            user_subscription_id: subscription.id,
            subservice_id: subservice.id,
            address_id: subscription.address_id,
            scheduled_date: date.toISOString().split("T")[0],
            status: "scheduled",
            visit_number: i,
            notes: `Custom - ${subservice.title} - Visit ${i}/${count}`,
          });
        }
      }
    }

    if (visits.length > 0) {
      await SubscriptionVisit.bulkCreate(visits);
      console.log(`SUCCESS: ${visits.length} visits created!`);
    }
  } catch (err) {
    console.error("Visit creation failed:", err);
  }
}

// UserSubscription.addHook("afterCreate", async (subscription, options) => {
//   try {
//     console.log("HOOK TRIGGERED for subscription:", subscription.id);
//     const visits = [];

//     // CASE 1: Standard Plan (Basic/Standard/Executive)
//     if (subscription.plan_id) {
//       const plan = await SubscriptionPlan.findByPk(subscription.plan_id);
//       console.log("Plan found:", plan?.name, "Visits count:", plan?.scheduled_visits_count);

//       // FIXED BUG HERE
//       if (!plan || !plan.scheduled_visits_count || plan.scheduled_visits_count <= 0) {
//         console.log("No scheduled_visits_count → skipping");
//         return;
//       }

//       const visitCount = plan.scheduled_visits_count;
//       const startDate = new Date(subscription.start_date);
//       const interval = 12 / visitCount;

//       console.log(`Creating ${visitCount} visits for ${plan.name}`);

//       // FIXED LOOP: from 1 to visitCount (not 0 to visitCount)
//       for (let i = 1; i <= visitCount; i++) {
//         const date = new Date(startDate);
//         date.setMonth(startDate.getMonth() + Math.round(interval * (i - 0.5)));

//         visits.push({
//           user_subscription_id: subscription.id,
//           subservice_id: null,
//           address_id: subscription.address_id,
//           scheduled_date: date.toISOString().split("T")[0],
//           status: "scheduled",
//           visit_number: i,
//           notes: `${plan.name} Plan - Visit ${i}/${visitCount} (Service to be assigned)`,
//         });
//       }
//     }

//     // CASE 2: Custom Plan
//     else if (!subscription.plan_id) {
//       const customLines = await UserSubscriptionCustom.findAll({
//         where: { user_subscription_id: subscription.id },
//         transaction: options.transaction,
//       });

//       console.log("Custom lines found:", customLines.length);

//       for (const line of customLines) {
//         if (!line.subservice_id) continue;

//         const subservice = await SubService.findByPk(line.subservice_id);
//         if (!subservice || !subservice.sub_service_visit_count) continue;

//         const visitCount = subservice.sub_service_visit_count;
//         const startDate = new Date(subscription.start_date);
//         const interval = 12 / visitCount;

//         for (let i = 1; i <= visitCount; i++) {
//           const date = new Date(startDate);
//           date.setMonth(startDate.getMonth() + Math.round(interval * (i - 0.5)));

//           visits.push({
//             user_subscription_id: subscription.id,
//             subservice_id: subservice.id,
//             address_id: subscription.address_id,
//             scheduled_date: date.toISOString().split("T")[0],
//             status: "scheduled",
//             visit_number: i,
//             notes: `Custom - ${subservice.title} - Visit ${i}/${visitCount}`,
//           });
//         }
//       }
//     }

//     if (visits.length > 0) {
//       await SubscriptionVisit.bulkCreate(visits, { transaction: options.transaction });
//       console.log(`SUCCESS: Created ${visits.length} visits!`);
//     } else {
//       console.log("No visits created (no valid data)");
//     }

//   } catch (error) {
//     console.error("HOOK FAILED:", error);
//   }
// });
