const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const UserSubscriptionSchedule = sequelize.define(
  "UserSubscriptionSchedule",
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
    user_subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // optional link to which service/sub-service this scheduled visit is for
    service_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    sub_service_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    scheduled_time: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Optional timeslot text",
    },
    status: {
      type: DataTypes.ENUM("scheduled", "completed", "cancelled", "missed"),
      allowNull: false,
      defaultValue: "scheduled",
    },
    technician_visit_done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sequence_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1..N sequence within subscription based on plan scheduling",
    },
  },
  {
    tableName: "user_subscription_schedules",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = UserSubscriptionSchedule;
