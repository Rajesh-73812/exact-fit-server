"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove title column
    await queryInterface.removeColumn("user_subscription_custom", "title");

    // Remove description column
    await queryInterface.removeColumn(
      "user_subscription_custom",
      "description"
    );

    // Remove service_id column
    await queryInterface.removeColumn("user_subscription_custom", "service_id");
  },

  async down(queryInterface, Sequelize) {
    // Add title column back
    await queryInterface.addColumn("user_subscription_custom", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add description column back
    await queryInterface.addColumn("user_subscription_custom", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add service_id column back
    await queryInterface.addColumn("user_subscription_custom", "service_id", {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },
};
