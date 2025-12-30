// models/adminRole.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AdminRole = sequelize.define(
  "AdminRole",
  {
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: "admin_roles",
    timestamps: false,
  }
);

module.exports = AdminRole;
