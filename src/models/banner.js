const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const banner = sequelize.define(
  "Banner",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    link_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    schedule_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    banner_type: {
      type: DataTypes.ENUM(
        "homepage",
        "category",
        "service",
        "aboutus",
        "contactus"
      ),
      allowNull: false,
    },
  },
  {
    tableName: "banners",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = banner;
