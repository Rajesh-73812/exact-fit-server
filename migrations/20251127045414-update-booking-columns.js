"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove full_fit_out column
    await queryInterface.removeColumn("bookings", "full_fit_out");

    // Remove work_type column
    await queryInterface.removeColumn("bookings", "work_type");

    // Change datatype of specific_work_type from JSON → STRING
    await queryInterface.changeColumn("bookings", "specific_work_type", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Stores single specific work as text",
    });
  },

  async down(queryInterface, Sequelize) {
    // Add full_fit_out back
    await queryInterface.addColumn("bookings", "full_fit_out", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Design + Execution details",
    });

    // Add work_type back
    await queryInterface.addColumn("bookings", "work_type", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Renovation / Refabrication",
    });

    // Revert datatype of specific_work_type back to JSON
    await queryInterface.changeColumn("bookings", "specific_work_type", {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "Stores multiple specific works like Flooring, Ceiling etc",
    });
  },
};
