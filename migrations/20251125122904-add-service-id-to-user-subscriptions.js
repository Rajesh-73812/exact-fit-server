"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("user_subscriptions", "service_id", {
      type: Sequelize.UUID,
      allowNull: true,
      after: "property_type_id", // works in MySQL
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user_subscriptions", "service_id");
  },
};
