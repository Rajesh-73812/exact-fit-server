"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "users", // The table name
      "is_profile_update", // The new column name
      {
        type: Sequelize.BOOLEAN, // Column type
        defaultValue: false, // Default value is false
        after: "role", // Place it after the "role" column
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "is_profile_update");
  },
};
