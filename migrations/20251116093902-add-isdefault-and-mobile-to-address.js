"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Add is_default (after save_as_address_type)
    await queryInterface.addColumn(
      "address", // Table name
      "is_default", // Column name
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Marks whether this is the default address",
        after: "save_as_address_type",
      }
    );

    await queryInterface.addColumn("address", "mobile", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Optional mobile number for this address",
      after: "is_default",
    });
  },

  async down(queryInterface) {
    // Rollback: remove columns in reverse order
    await queryInterface.removeColumn("address", "mobile");
    await queryInterface.removeColumn("address", "is_default");
  },
};
