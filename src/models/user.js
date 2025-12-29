const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const user = sequelize.define(
  "User",
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
    fullname: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [2, 255],
          msg: "Full name must be between 2 and 255 characters",
        },
      },
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [6, 255],
          msg: "Password must be between 6 and 255 characters",
        },
      },
    },
    role: {
      type: DataTypes.ENUM("technician", "superadmin", "customer"), // add super admin if needed
      allowNull: false,
      validate: {
        notEmpty: { msg: "Role cannot be empty" },
        isIn: {
          args: [["technician", "admin", "customer"]],
          msg: "Role must be one of: technician, admin, customer",
        },
      },
    },
    service_type: {
      type: DataTypes.ENUM("enquiry", "subscription", "both"),
      allowNull: true,
    },
    skill: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    emirates_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_profile_update: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    id_proofs: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Stores uploaded ID proof URLs (Aadhar, Emirates ID, etc.)",
    },
    id_proof_type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID Proof type (Aadhar, PAN, Passport etc)",
    },
    service_category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment:
        "Technician’s main service category (e.g., electrician, plumber)",
    },

    services_known: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "List of services the technician can perform",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Technician’s profile or work description",
    },
    onesignal_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Onesignal ID must be at most 255 characters",
        },
      },
    },
    profile_pic: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Profile picture URL must be at most 255 characters",
        },
      },
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "Last login must be a valid date" },
      },
    },
    subscription_plan_id: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isUUID: {
          args: 4,
          msg: "User ID must be a valid UUID v4",
        },
      },
    },
    plan_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: { msg: "Plan start date must be a valid date" },
      },
    },
    plan_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: { msg: "Plan end date must be a valid date" },
        isAfterPlanStart(value) {
          if (
            value &&
            this.plan_start_date &&
            new Date(value) <= new Date(this.plan_start_date)
          ) {
            throw new Error("Plan end date must be after plan start date");
          }
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "is_active must be either true or false",
        },
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: {
          args: [["pending", "approved", "rejected"]],
          msg: "Status must be one of: pending, approved, rejected",
        },
      },
    },
  },
  { tableName: "users", timestamps: true, paranoid: true }
);

module.exports = user;
