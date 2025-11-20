const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const slugify = require("slugify");

const subService = sequelize.define(
  "sub_service",
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
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      validate: {
        isUUID: 4,
      },
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sub_service_slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_alt: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
      allowNull: false,
    },
    external_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    hero_banner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "sub_service",
    timestamps: true,
    paranoid: true,
    // models/sub_service.js
    hooks: {
      beforeValidate: (subService, options) => {
        // ← rename parameter
        if (subService.title) {
          const baseSlug = slugify(subService.title, {
            lower: true,
            strict: true,
            locale: "en",
            trim: true,
          });

          // CORRECT field name
          if (!subService.sub_service_slug || subService.changed("title")) {
            subService.sub_service_slug = baseSlug;
          }
        }
      },
    },
  }
);

module.exports = subService;
