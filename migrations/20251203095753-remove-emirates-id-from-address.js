"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("address", "emirates_id");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("address", "emirates_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
