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

    service_id: {
      type: DataTypes.UUID,
      allowNull: false,
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

    scope_of_work: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    full_fit_out: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Design + Execution details",
    },

    work_type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Renovation / Refabrication",
    },

    specific_work_type: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Stores multiple specific works like Flooring, Ceiling etc",
    },

    existing_drawing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether user has existing drawing or not (true/false)",
    },

    plan_images: {
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
  },
  {
    tableName: "bookings",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Booking;
