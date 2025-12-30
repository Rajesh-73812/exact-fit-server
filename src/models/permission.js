const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Permission = sequelize.define(
  "Permission",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false, // eg: services:view
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "permissions",
    timestamps: true,
  }
);

module.exports = Permission;
