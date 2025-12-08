"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("notifications", "status", {
      type: Sequelize.ENUM("pending", "sent", "failed"),
      allowNull: false,
      defaultValue: "pending",
      after: "user_id", // place after user_id
    });

    await queryInterface.addColumn("notifications", "total_recipients", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: "status", // place after status
    });

    await queryInterface.addColumn("notifications", "sent_count", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: "total_recipients", // place after total_recipients
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("notifications", "sent_count");
    await queryInterface.removeColumn("notifications", "total_recipients");
    await queryInterface.removeColumn("notifications", "status");

    // If ENUM is used, drop ENUM type to avoid residue
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notifications_status";'
    );
  },
};
