"use strict";

// const { all } = require("axios");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new column total_amount
    await queryInterface.addColumn("user_subscription_custom", "total_amount", {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: "total amount = quantity * unit_price",
      after: "unit_price",
    });

    // Remove address column
    await queryInterface.removeColumn("user_subscription_custom", "address");
  },

  async down(queryInterface, Sequelize) {
    // Rollback: Add address column back
    await queryInterface.addColumn("user_subscription_custom", "address", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Rollback: Remove total_amount
    await queryInterface.removeColumn(
      "user_subscription_custom",
      "total_amount"
    );
  },
};
