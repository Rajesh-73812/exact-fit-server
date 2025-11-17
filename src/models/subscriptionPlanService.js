const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const SubscriptionPlanService = sequelize.define(
  "SubscriptionPlanService",
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
    service_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    limit_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "e.g. first 6 routine callouts free",
    },
    is_unlimited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    response_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // B -> service-wise scheduled visits count (override/define service-level visits)
    scheduled_visits_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Number of scheduled visits for this specific service within plan duration",
    },
  },
  {
    tableName: "subscription_plan_services",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SubscriptionPlanService;
