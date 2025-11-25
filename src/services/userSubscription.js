const Plan = require("../models/subscriptionPlan");
const PropertyType = require("../models/propertyType");
const UserSubscription = require("../models/userSubscription");
const User = require("../models/user");

const createSubscription = async (data) => {
  const {
    user_id,
    plan_id,
    property_type_id,
    start_date,
    end_date,
    price_total,
    payment_option,
  } = data;

  // Fetch plan details from the Plan model
  const plan = await Plan.findOne({ where: { id: plan_id } });
  if (!plan) {
    throw new Error("Plan not found");
  }

  // Fetch property type details from the PropertyType model
  const propertyType = property_type_id
    ? await PropertyType.findOne({ where: { id: property_type_id } })
    : null;

  // Fetch user details from the User model
  const user = await User.findOne({ where: { id: user_id } });
  if (!user) {
    throw new Error("User not found");
  }

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
  };

  console.log(planSnapshot, "snapshotttt");
  const subscription = await UserSubscription.create({
    user_id,
    plan_id,
    property_type_id,
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

module.exports = {
  createSubscription,
};
