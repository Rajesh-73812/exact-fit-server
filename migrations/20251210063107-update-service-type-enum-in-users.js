"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Clean or normalize existing values if needed (optional)
    // Example: Set NULL for unexpected values (avoid migration failure)
    await queryInterface.sequelize.query(`
      UPDATE users
      SET service_type = NULL
      WHERE service_type NOT IN ('enquiry', 'subscription', 'both');
    `);

    // Step 2: Change column to ENUM
    await queryInterface.changeColumn("users", "service_type", {
      type: Sequelize.ENUM("enquiry", "subscription", "both"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert to VARCHAR(20)
    await queryInterface.changeColumn("users", "service_type", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
  },
};
