"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn("sub_service", "sub_service_visit_count", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 3,
      after: "status", // ⬅️ place after status (MySQL supported only)
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      "sub_service",
      "sub_service_visit_count"
    );
  },
};
