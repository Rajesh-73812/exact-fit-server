// models/planSubService.js
const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const PlanSubService = sequelize.define(
  "PlanSubService",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    subscription_plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    visit_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      comment: "How many visits of this subservice are included in the plan",
    },
    price_override: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Custom price for this subservice in this plan (optional)",
    },
  },
  {
    tableName: "plan_subservices",
    timestamps: true,
  }
);

module.exports = PlanSubService;