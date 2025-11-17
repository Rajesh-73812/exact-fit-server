const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const SubscriptionCustomPlanSubservice = sequelize.define(
  "SubscriptionCustomPlanSubservice",
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
    sub_service_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "subscription_custom_plan_subservices",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SubscriptionCustomPlanSubservice;
