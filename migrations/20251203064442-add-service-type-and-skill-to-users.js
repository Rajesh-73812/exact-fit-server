"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add skill column only
    await queryInterface.addColumn("users", "skill", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "service_type",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove skill column
    await queryInterface.removeColumn("users", "skill");
  },
};
