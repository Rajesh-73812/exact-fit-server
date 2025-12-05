const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Settings = sequelize.define(
  "Settings",
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
    support_mobile_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    support_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_us_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_us_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { tableName: "settings", paranoid: true, timestamps: true }
);

module.exports = Settings;
