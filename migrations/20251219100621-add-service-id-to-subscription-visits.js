"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("subscription_visits", "service_id", {
      type: Sequelize.UUID,
      allowNull: true,
      after: "user_subscription_id", // MySQL only (works fine)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("subscription_visits", "service_id");
  },
};
