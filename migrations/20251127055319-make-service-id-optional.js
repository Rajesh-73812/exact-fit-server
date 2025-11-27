"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("bookings", "service_id", {
      type: Sequelize.UUID,
      allowNull: true, // Make optional
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("bookings", "service_id", {
      type: Sequelize.UUID,
      allowNull: false, // Rollback to required
    });
  },
};
