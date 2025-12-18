"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Change ENUM to new allowed values
    await queryInterface.changeColumn("tickets", "status", {
      type: Sequelize.ENUM(
        "opened",
        "pending",
        "in_progress",
        "completed"
      ),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback to old ENUM values
    await queryInterface.changeColumn("tickets", "status", {
      type: Sequelize.ENUM(
        "pending",
        "in_progress",
        "completed",
        "hold",
        "resolved"
      ),
      allowNull: false,
      defaultValue: "pending",
    });
  },
};
