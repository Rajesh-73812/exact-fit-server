
const sequelize = require("../config/db");
const User = require("./user");
const PropertyType = require("./propertyType");
const SubscriptionPlan = require("./subscriptionPlan");
const SubscriptionPlanPropertyPrice = require("./subscriptionPlanPropertyPrice");
const Service = require("./service");
const SubService = require("./sub-service");
const SubscriptionPlanService = require("./subscriptionPlanService");
const SubscriptionCustomPlanSubservice = require("./subscriptionCustomPlanSubservice");
const UserSubscription = require("./userSubscription");
const UserSubscriptionSchedule = require("./userSubscriptionSchedule");
const Address = require("./address");

// ========== Associations ==========

// PropertyType
PropertyType.hasMany(SubscriptionPlanPropertyPrice, {
  foreignKey: "property_type_id",
  as: "plan_prices",
});
SubscriptionPlanPropertyPrice.belongsTo(PropertyType, {
  foreignKey: "property_type_id",
  as: "property_type",
});

// SubscriptionPlan -> property prices
SubscriptionPlan.hasMany(SubscriptionPlanPropertyPrice, {
  foreignKey: "plan_id",
  as: "property_prices",
});
SubscriptionPlanPropertyPrice.belongsTo(SubscriptionPlan, {
  foreignKey: "plan_id",
  as: "plan",
});

// SubscriptionPlan -> SubscriptionPlanService (fixed plans: services included)
SubscriptionPlan.hasMany(SubscriptionPlanService, {
  foreignKey: "plan_id",
  as: "plan_services",
});
SubscriptionPlanService.belongsTo(SubscriptionPlan, {
  foreignKey: "plan_id",
  as: "plan",
});

// Service -> SubService
Service.hasMany(SubService, {
  foreignKey: "service_id",
  as: "sub_services",
});
SubService.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

// Service -> SubscriptionPlanService
Service.hasMany(SubscriptionPlanService, {
  foreignKey: "service_id",
  as: "service_plan_links",
});
SubscriptionPlanService.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

// SubscriptionPlan -> SubscriptionCustomPlanSubservice (custom plan subservices)
SubscriptionPlan.hasMany(SubscriptionCustomPlanSubservice, {
  foreignKey: "plan_id",
  as: "custom_subservices",
});
SubscriptionCustomPlanSubservice.belongsTo(SubscriptionPlan, {
  foreignKey: "plan_id",
  as: "plan",
});

// SubService -> SubscriptionCustomPlanSubservice
SubService.hasMany(SubscriptionCustomPlanSubservice, {
  foreignKey: "sub_service_id",
  as: "custom_plan_rows",
});
SubscriptionCustomPlanSubservice.belongsTo(SubService, {
  foreignKey: "sub_service_id",
  as: "sub_service",
});

// UserSubscription relations
SubscriptionPlan.hasMany(UserSubscription, {
  foreignKey: "plan_id",
  as: "user_subscriptions",
});
UserSubscription.belongsTo(SubscriptionPlan, {
  foreignKey: "plan_id",
  as: "plan",
});

PropertyType.hasMany(UserSubscription, {
  foreignKey: "property_type_id",
  as: "user_subscriptions",
});
UserSubscription.belongsTo(PropertyType, {
  foreignKey: "property_type_id",
  as: "property_type",
});

// NOTE: user model not included here - if you have a Users model, connect it:
// const User = require("./User");
// User.hasMany(UserSubscription, { foreignKey: "user_id", as: "subscriptions" });
// UserSubscription.belongsTo(User, { foreignKey: "user_id", as: "user" });

// UserSubscription -> schedule entries
UserSubscription.hasMany(UserSubscriptionSchedule, {
  foreignKey: "user_subscription_id",
  as: "schedules",
});
UserSubscriptionSchedule.belongsTo(UserSubscription, {
  foreignKey: "user_subscription_id",
  as: "subscription",
});

// Optionally link schedule to service/sub_service
Service.hasMany(UserSubscriptionSchedule, {
  foreignKey: "service_id",
  as: "schedules",
});
UserSubscriptionSchedule.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

SubService.hasMany(UserSubscriptionSchedule, {
  foreignKey: "sub_service_id",
  as: "schedules",
});
UserSubscriptionSchedule.belongsTo(SubService, {
  foreignKey: "sub_service_id",
  as: "sub_service",
});

User.hasMany(Address, { foreignKey: "user_id", as: "addresses" });
Address.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Export all models and sequelize instance for easier import
module.exports = {
  sequelize,
  Address,
  User,
  PropertyType,
  SubscriptionPlan,
  SubscriptionPlanPropertyPrice,
  Service,
  SubService,
  SubscriptionPlanService,
  SubscriptionCustomPlanSubservice,
  UserSubscription,
  UserSubscriptionSchedule,
};

