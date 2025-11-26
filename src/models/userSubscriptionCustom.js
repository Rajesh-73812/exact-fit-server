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
    subservice_id: {
      type: DataTypes.UUID,
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

    total_amount: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "total amount = quantity * unit_price",
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
