const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      index: true,
    },

    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Full name or company name",
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    booking_type: {
      type: DataTypes.ENUM("emergency", "enquiry"),
      allowNull: true,
    },

    service_id: {
      type: DataTypes.UUID,
      allowNull: true,
      index: true,
    },

    sub_service_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    address_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "Selected from saved addresses list",
    },

    technician_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    scope_of_work: {
      type: DataTypes.TEXT,
      allowNull: true, // full-fit-out / renovation / refabrication details
    },

    specific_work_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    existing_drawing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether user has existing drawing or not (true/false)",
    },

    plan_images: {
      // mandatory field if existing_drawing is true
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of CAD / PDF / Images (multiple)",
    },

    estimated_budget_range: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "active", "cancelled", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },

    booking_snapshot: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "bookings",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Booking;
