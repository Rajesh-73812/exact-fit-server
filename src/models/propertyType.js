const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const PropertyType = sequelize.define(
  "PropertyType",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    category: {
      type: DataTypes.ENUM("residential", "commercial"),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "PropertyType",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = PropertyType;
