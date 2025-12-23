const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SubscriptionVisit = sequelize.define(
  "SubscriptionVisit",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      validate: {
        isUUID: 4,
      },
    },
    user_subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      index: true,
      validate: {
        isUUID: 4,
      },
    },
    subservice_id: {
      type: DataTypes.UUID,
      allowNull: true,
      index: true,
      validate: {
        isUUID: 4,
      },
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isUUID: 4,
      },
    },
    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: "Scheduled date must be a valid date" },
      },
    },
    actual_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "Actual date must be a valid date" },
      },
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "pending",
        "in_progress",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "scheduled",
    },
    technician_id: {
      type: DataTypes.UUID,
      allowNull: true,
      index: true,
      validate: {
        isUUID: 4,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    visit_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment:
        "Sequence within subscription (e.g., 1/3, 2/3, 3/3 for AC yearly)",
    },
  },
  {
    tableName: "subscription_visits",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SubscriptionVisit;
