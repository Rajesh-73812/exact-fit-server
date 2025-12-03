"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("address", "emirates_id", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "category", // add after category
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("address", "emirates_id");
  },
};
