"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("notifications", "is_read", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // 0
      after: "sent_count", // MySQL-specific, works fine here
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("notifications", "is_read");
  },
};
