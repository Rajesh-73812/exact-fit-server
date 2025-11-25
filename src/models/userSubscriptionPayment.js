const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserSubscriptionPayment = sequelize.define(
  "UserSubscriptionPayment",
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
    user_subscription_id: {
      // it comes from usersubscription or usersubscriptioncustom
      type: DataTypes.UUID,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    paid_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("due", "processing", "paid", "failed", "refunded"),
      allowNull: false,
      defaultValue: "due",
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "user_subscription_payments",
    timestamps: true,
    underscored: true,
  }
);

module.exports = UserSubscriptionPayment;
