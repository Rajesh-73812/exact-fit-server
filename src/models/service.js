const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const slugify = require("slugify");

const service = sequelize.define(
  "service",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_slug: {
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
    type: {
      type: DataTypes.ENUM("enquiry", "subscription"),
      allowNull: true,
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
  },
  {
    tableName: "service",
    timestamps: true,
    paranoid: true,
    hooks: {
      // This hook runs before validation, ensuring the slug is present for uniqueness checks
      beforeValidate: (service, options) => {
        // Only generate slug if title is present and service_slug is not already set //options → an object containing metadata about the query
        console.log(options.transaction, "comes from service options");
        if (service.title) {
          let baseSlug = slugify(service.title, {
            lower: true,
            strict: true,
            locale: "en", //locale: "en" tells slugify to use English language character mapping when generating the slug.
            trim: true,
          });
          // For new records, or if title changed, generate/update the slug
          if (!service.service_slug || service.changed("title")) {
            service.service_slug = baseSlug;
          }
        }
      },
    },
  }
);

module.exports = service;
