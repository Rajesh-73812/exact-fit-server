"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Expand ENUM to include "staff"
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM("technician", "superadmin", "customer", "staff"),
      allowNull: false,
    });

    // 2️⃣ Add role_name column AFTER role
    await queryInterface.addColumn("users", "role_name", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "role", // ✅ MySQL-only but works perfectly
    });
  },

  async down(queryInterface, Sequelize) {
    // 1️⃣ Remove role_name column
    await queryInterface.removeColumn("users", "role_name");

    // 2️⃣ Shrink ENUM back (remove staff)
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM("technician", "superadmin", "customer"),
      allowNull: false,
    });
  },
};
