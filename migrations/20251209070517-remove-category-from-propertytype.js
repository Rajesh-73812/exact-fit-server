"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.removeColumn("PropertyType", "category");
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.addColumn("PropertyType", "category", {
      type: Sequelize.ENUM("residential", "commercial"),
      allowNull: true,
    });
  },
};
