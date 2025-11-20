"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add `building` column after `emirate`. The `after` option works on MySQL.
    // For other dialects the column will be added but "after" may be ignored.
    await queryInterface.addColumn(
      "address", // table name
      "building", // new column name
      {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Building name/number (optional)",
        after: "emirate",
      }
    );
  },

  down: async (queryInterface /* , Sequelize */) => {
    await queryInterface.removeColumn("address", "building");
  },
};
