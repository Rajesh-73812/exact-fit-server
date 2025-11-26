const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const SubscriptionPlan = sequelize.define(
  "SubscriptionPlan",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      validate: {
        isUUID: 4,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    duration_in_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 365,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Plan-level scheduled visits count (A)
    scheduled_visits_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Number of scheduled visits per duration (plan-level default)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "subscription_plans",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SubscriptionPlan;
