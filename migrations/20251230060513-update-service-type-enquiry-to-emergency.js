"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Expand ENUM to allow BOTH values
    await queryInterface.changeColumn("users", "service_type", {
      type: Sequelize.ENUM("enquiry", "emergency", "subscription", "both"),
      allowNull: true,
    });

    // 2️⃣ Update existing data
    await queryInterface.sequelize.query(`
      UPDATE users
      SET service_type = 'emergency'
      WHERE service_type = 'enquiry'
    `);

    // 3️⃣ Shrink ENUM (remove enquiry)
    await queryInterface.changeColumn("users", "service_type", {
      type: Sequelize.ENUM("emergency", "subscription", "both"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // 1️⃣ Expand ENUM again
    await queryInterface.changeColumn("users", "service_type", {
      type: Sequelize.ENUM("enquiry", "emergency", "subscription", "both"),
      allowNull: true,
    });

    // 2️⃣ Revert data
    await queryInterface.sequelize.query(`
      UPDATE users
      SET service_type = 'enquiry'
      WHERE service_type = 'emergency'
    `);

    // 3️⃣ Shrink ENUM back
    await queryInterface.changeColumn("users", "service_type", {
      type: Sequelize.ENUM("enquiry", "subscription", "both"),
      allowNull: true,
    });
  },
};
