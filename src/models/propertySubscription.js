const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const PropertySubscription = sequelize.define(
  "PropertySubscription",
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
    property_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subscription_plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    commercial_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    residential_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: "PropertySubscriptions",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = PropertySubscription;
