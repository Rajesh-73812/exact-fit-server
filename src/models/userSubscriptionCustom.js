const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserSubscriptionCustom = sequelize.define(
  "UserSubscriptionCustom",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    user_subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    service_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subservice_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    // snapshot fields (store copy of title & description so history won't break when service changes)
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // quantity + price (price per unit in smallest currency unit)
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unit_price: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      comment: "unit price in smallest currency unit",
    },

    address: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    // free-form metadata for future extension (json)
    snapshot: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "user_subscription_custom",
    timestamps: true,
    underscored: true,
  }
);

module.exports = UserSubscriptionCustom;
