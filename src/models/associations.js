const User = require("./user");
const Address = require("./address");
const sequelize = require("../config/db");

// In models/index.js or after model definitions
User.hasMany(Address, { foreignKey: "user_id", as: "addresses" });
Address.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = { sequelize, User, Address };
