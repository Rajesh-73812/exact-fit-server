const User = require("./user");
const Address = require("./address");
const sequelize = require("../config/db");
const Service = require("../models/service");
const SubService = require("../models/sub-service");
const PropertySubscription = require("../models/propertySubscription");
const PropertyType = require("../models/propertyType");
const UserSubscriptionCustom = require("../models/userSubscriptionCustom");
const UserSubscription = require("../models/userSubscription");

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

module.exports = {
  sequelize,
  User,
  Address,
  Service,
  SubService,
  PropertyType,
  PropertySubscription,
};
