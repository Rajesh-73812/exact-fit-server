const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const UserSubscription = sequelize.define(
  "UserSubscription",
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
    user_id: {
      type: DataTypes.UUID,
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
    price_at_purchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "expired", "cancelled"),
      defaultValue: "active",
    },
    technician_visit_done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "General flag (legacy). Use schedules table for per-visit tracking.",
    },
  },
  {
    tableName: "user_subscriptions",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = UserSubscription;
