"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.removeColumn("bookings", "specific_work_type");
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.addColumn("bookings", "specific_work_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
