// models/role.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // true = Super Admin role
    },
  },
  {
    tableName: "roles",
    timestamps: true,
  }
);

module.exports = Role;
