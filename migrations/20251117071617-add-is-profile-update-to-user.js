"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column already exists
    const table = await queryInterface.describeTable("users");

    if (!table["is_profile_update"]) {
      await queryInterface.addColumn("users", "is_profile_update", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        after: "role",
      });
    } else {
      console.log(
        "⚠️  Column 'is_profile_update' already exists — skipping addColumn."
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove column only if it exists
    const table = await queryInterface.describeTable("users");

    if (table["is_profile_update"]) {
      await queryInterface.removeColumn("users", "is_profile_update");
    } else {
      console.log(
        "⚠️  Column 'is_profile_update' does not exist — skipping removeColumn."
      );
    }
  },
};
