"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user_subscription_custom", "user_id");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("user_subscription_custom", "user_id", {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
