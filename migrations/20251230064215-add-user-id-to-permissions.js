"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("permissions", "user_id", {
      type: Sequelize.UUID,
      allowNull: false,
      after: "id", // ✅ MySQL specific, works fine
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("permissions", "user_id");
  },
};
