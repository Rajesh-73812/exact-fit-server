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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    property_type_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    plan_id: {
      type: DataTypes.UUID,
      allowNull: true,
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
      type: DataTypes.ENUM("active", "expired", "cancelled", "pending"),
      defaultValue: "active",
    },
    price_total: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "Total price in smallest currency unit (e.g. fils/paise/cents).",
    },
    payment_option: {
      type: DataTypes.ENUM("monthly", "yearly"),
      allowNull: false,
      defaultValue: "yearly",
    },
    amount_per_cycle: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "If monthly, amount for each billing cycle (in smallest unit).",
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "partial", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },

    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plan_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "user_subscriptions",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = UserSubscription;
