"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "emirates_id", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "skill", // ensures correct position in MySQL
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "emirates_id");
  },
};
