"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = "banners";

    // Remove schedule_time ONLY if exists
    const tableDesc = await queryInterface.describeTable(table);
    if (tableDesc.schedule_time) {
      await queryInterface.removeColumn(table, "schedule_time");
    }

    // Add start_date if not exists
    if (!tableDesc.start_date) {
      await queryInterface.addColumn(table, "start_date", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Add end_date if not exists
    if (!tableDesc.end_date) {
      await queryInterface.addColumn(table, "end_date", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = "banners";

    // Revert changes
    const tableDesc = await queryInterface.describeTable(table);
    if (tableDesc.start_date) {
      await queryInterface.removeColumn(table, "start_date");
    }
    if (tableDesc.end_date) {
      await queryInterface.removeColumn(table, "end_date");
    }

    if (!tableDesc.schedule_time) {
      await queryInterface.addColumn(table, "schedule_time", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
};
