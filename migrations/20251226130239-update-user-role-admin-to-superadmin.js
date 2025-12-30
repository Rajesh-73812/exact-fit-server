"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * STEP 1: Expand ENUM to allow BOTH admin & superadmin
     */
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM("technician", "admin", "superadmin", "customer"),
      allowNull: false,
    });

    /**
     * STEP 2: Update existing data
     */
    await queryInterface.sequelize.query(`
      UPDATE users
      SET role = 'superadmin'
      WHERE role = 'admin'
    `);

    /**
     * STEP 3: Remove admin from ENUM
     */
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM("technician", "superadmin", "customer"),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * STEP 1: Re-add admin
     */
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM("technician", "admin", "superadmin", "customer"),
      allowNull: false,
    });

    /**
     * STEP 2: Roll data back
     */
    await queryInterface.sequelize.query(`
      UPDATE users
      SET role = 'admin'
      WHERE role = 'superadmin'
    `);

    /**
     * STEP 3: Remove superadmin
     */
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM("technician", "admin", "customer"),
      allowNull: false,
    });
  },
};
