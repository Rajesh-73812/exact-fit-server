const User = require("./user");
const Address = require("./address");
const sequelize = require("../config/db");
const Service = require("../models/service");
const SubService = require("../models/sub-service");

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

module.exports = {
  sequelize,
  User,
  Address,
  Service,
  SubService,
};
