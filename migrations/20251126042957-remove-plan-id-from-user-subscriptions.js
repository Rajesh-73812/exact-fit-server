"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "user_subscriptions",
      "plan_id"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "user_subscriptions",
      "plan_id",
      {
        type: Sequelize.UUID,
        allowNull: false,
      }
    );
  },
};
