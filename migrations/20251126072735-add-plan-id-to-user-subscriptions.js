"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("user_subscriptions", "plan_id", {
      type: Sequelize.UUID,
      allowNull: true,
      after: "service_id", // works for MySQL to place column after service_id
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user_subscriptions", "plan_id");
  },
};
