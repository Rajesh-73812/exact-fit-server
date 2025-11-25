const Plan = require("../models/subscriptionPlan");
const PropertyType = require("../models/propertyType");
const UserSubscription = require("../models/userSubscription");
const User = require("../models/user");
const Address = require("../models/address");

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

module.exports = {
  createSubscription,
};
