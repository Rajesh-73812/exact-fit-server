const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ticket = sequelize.define(
  "ticket",
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
    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    user_id: {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Multiple images allowed",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "in_progress",
        "completed",
        "hold",
        "resolved"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  { tableName: "tickets", timestamps: true, paranoid: true }
);

module.exports = Ticket;
