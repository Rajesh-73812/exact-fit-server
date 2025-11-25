"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "user_subscriptions",
      "address_id",
      {
        type: Sequelize.UUID,
        allowNull: false,
        after: "user_id", // works in MySQL
      },
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user_subscriptions", "address_id");
  },
};
