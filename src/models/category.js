const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const slugify = require("slugify");

const category = sequelize.define(
  "Category",
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
    category_slug: {
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
    tableName: "category",
    timestamps: true,
    paranoid: true,
    hooks: {
      // This hook runs before validation, ensuring the slug is present for uniqueness checks
      beforeValidate: (category, options) => {
        // Only generate slug if title is present and category_slug is not already set //options → an object containing metadata about the query
        console.log(options.transaction, "comes from category options");
        if (category.title) {
          let baseSlug = slugify(category.title, {
            lower: true,
            strict: true,
            locale: "en", //locale: "en" tells slugify to use English language character mapping when generating the slug.
            trim: true,
          });
          // For new records, or if title changed, generate/update the slug
          if (!category.category_slug || category.changed("title")) {
            category.category_slug = baseSlug;
          }
        }
      },
    },
  }
);

module.exports = category;
