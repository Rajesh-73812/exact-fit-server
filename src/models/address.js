const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const address = sequelize.define(
  "Address",
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    emirate: {
      //an area of land that is ruled over by an emir
      type: DataTypes.STRING,
      allowNull: true,
    },
    building: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Building name or number (optional)",
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    appartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addtional_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM("residential", "commercial"), //residential, commercial
      allowNull: true,
    },
    emirates_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    save_as_address_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Latitude coordinate of the user",
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Longitude coordinate of the user",
    },
  },
  { tableName: "address", timestamps: true, paranoid: true }
);
module.exports = address;
