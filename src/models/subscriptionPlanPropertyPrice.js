const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const SubscriptionPlanPropertyPrice = sequelize.define(
  "SubscriptionPlanPropertyPrice",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    property_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "subscription_plan_property_prices",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SubscriptionPlanPropertyPrice;
