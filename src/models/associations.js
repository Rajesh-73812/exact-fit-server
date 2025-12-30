const User = require("./user");
const Address = require("./address");
const sequelize = require("../config/db");
const Service = require("../models/service");
const SubService = require("../models/sub-service");
const PropertySubscription = require("../models/propertySubscription");
const PropertyType = require("../models/propertyType");
const UserSubscriptionCustom = require("../models/userSubscriptionCustom");
const UserSubscription = require("../models/userSubscription");
const SubscriptionPlan = require("../models/subscriptionPlan");
const SubscriptionVisit = require("../models/SubscriptionVisit");
const NotificationRecipeient = require("../models/notification_recipeient");
const Notification = require("../models/notification");
const PlanSubService = require("../models/planSubService");
const Booking = require("../models/booking");
const Role = require("./role");
const Permission = require("./permission");
const RolePermission = require("./rolepermission");
const AdminRole = require("./adminrole");

// In models/index.js or after model definitions
User.hasMany(Address, {
  foreignKey: "user_id",
  as: "addresses",
  onDelete: "CASCADE",
}); // If a user is deleted, their addresses are also deleted
Address.belongsTo(User, { foreignKey: "user_id", as: "user" });

Service.hasMany(SubService, {
  foreignKey: "service_id",
  as: "sub_services",
  onDelete: "CASCADE",
});
SubService.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
  targetKey: "id",
  onDelete: "CASCADE",
});

PropertyType.hasMany(PropertySubscription, {
  foreignKey: "property_type_id",
  as: "propertySubscriptions",
});
PropertySubscription.belongsTo(PropertyType, {
  foreignKey: "property_type_id",
  as: "propertyType",
});

UserSubscription.hasMany(UserSubscriptionCustom, {
  foreignKey: "user_subscription_id",
  as: "custom_items",
});
UserSubscriptionCustom.belongsTo(UserSubscription, {
  foreignKey: "user_subscription_id",
  as: "user_subscription",
});

User.hasMany(UserSubscription, { foreignKey: "user_id", as: "subscriptions" });
UserSubscription.belongsTo(User, { foreignKey: "user_id", as: "user" });

SubscriptionPlan.hasMany(UserSubscription, {
  foreignKey: "plan_id",
  as: "user_subscriptions",
});
UserSubscription.belongsTo(SubscriptionPlan, {
  foreignKey: "plan_id",
  as: "subscription_plan",
});

Notification.hasMany(NotificationRecipeient, {
  foreignKey: "notification_id",
  as: "recipients",
  onDelete: "CASCADE",
});
NotificationRecipeient.belongsTo(Notification, {
  foreignKey: "notification_id",
  as: "notification",
});

NotificationRecipeient.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(NotificationRecipeient, {
  foreignKey: "user_id",
  as: "receivedNotifications",
});

SubscriptionVisit.belongsTo(UserSubscription, {
  as: "user_subscription",
  foreignKey: "user_subscription_id",
});
UserSubscription.hasMany(SubscriptionVisit, {
  as: "visits",
  foreignKey: "user_subscription_id",
});

SubscriptionPlan.hasMany(PlanSubService, {
  foreignKey: "subscription_plan_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "planSubServices",
});

PlanSubService.belongsTo(SubscriptionPlan, {
  foreignKey: "subscription_plan_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "subscriptionPlan",
});

PlanSubService.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
  onDelete: "CASCADE",
});

Service.hasMany(PlanSubService, {
  foreignKey: "service_id",
  as: "planSubServices",
});

UserSubscriptionCustom.belongsTo(SubService, {
  foreignKey: "subservice_id",
  as: "subservice",
});

SubService.hasMany(UserSubscriptionCustom, {
  foreignKey: "subservice_id",
  as: "custom_items",
});

// association between Service and SubscriptionVisit
SubService.hasMany(SubscriptionVisit, {
  foreignKey: "subservice_id",
  as: "subscription_visits",
  onDelete: "SET NULL",
});
SubscriptionVisit.belongsTo(SubService, {
  foreignKey: "subservice_id",
  as: "subservice",
});

Service.hasMany(SubscriptionVisit, {
  foreignKey: "service_id",
  as: "subscriptionVisits",
  onDelete: "SET NULL",
});
SubscriptionVisit.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
  onDelete: "SET NULL",
});

SubscriptionVisit.belongsTo(User, {
  foreignKey: "technician_id",
  as: "technician",
});
User.hasMany(SubscriptionVisit, {
  foreignKey: "technician_id",
  as: "assignedVisits",
});
Booking.belongsTo(Address, { foreignKey: "address_id", as: "address" });
Address.hasOne(Booking, { foreignKey: "address_id", as: "booking" });

User.belongsToMany(Role, {
  through: AdminRole,
  foreignKey: "admin_id",
});

Role.belongsToMany(User, {
  through: AdminRole,
  foreignKey: "role_id",
});

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "role_id",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permission_id",
});

// Service ↔ Booking
Service.hasMany(Booking, {
  foreignKey: "service_id",
  as: "bookings",
  onDelete: "SET NULL",
});

Booking.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

SubService.hasMany(Booking, {
  foreignKey: "sub_service_id",
  as: "bookings",
  onDelete: "SET NULL",
});

Booking.belongsTo(SubService, {
  foreignKey: "sub_service_id",
  as: "subservice",
});

module.exports = {
  sequelize,
  User,
  Address,
  Service,
  SubService,
  PropertyType,
  PropertySubscription,
  UserSubscriptionCustom,
  UserSubscription,
  NotificationRecipeient,
  Notification,
  Role,
  Permission,
  RolePermission,
  AdminRole,
};
