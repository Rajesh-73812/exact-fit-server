"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("service", "type", {
      type: Sequelize.ENUM("enquiry", "subscription"),
      allowNull: true,
      after: "description", // ensures column positioning in MySQL
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove column first
    await queryInterface.removeColumn("service", "type");

    // Drop enum type for PostgreSQL users to avoid conflicts (safe for MySQL too)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_service_type";'
    );
  },
};
