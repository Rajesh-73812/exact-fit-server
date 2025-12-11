const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const NotificationRecipeient = sequelize.define(
  "NotificationRecipeient",
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
    notification_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sent_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { tableName: "notification_recipeients", timestamps: true, paranoid: true }
);

module.exports = NotificationRecipeient;
