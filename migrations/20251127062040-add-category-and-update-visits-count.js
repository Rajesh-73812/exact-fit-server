"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Add category column
    await queryInterface.addColumn("subscription_plans", "category", {
      type: Sequelize.ENUM("residential", "commercial"),
      allowNull: false,
      defaultValue: "residential", // Or null if you want
      after: "slug",
    });

    // 2️⃣ Update default value of scheduled_visits_count to 3
    await queryInterface.changeColumn(
      "subscription_plans",
      "scheduled_visits_count",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: "Number of scheduled visits per duration (plan-level default)",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // rollback default change
    await queryInterface.changeColumn(
      "subscription_plans",
      "scheduled_visits_count",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "Number of scheduled visits per duration (plan-level default)",
      }
    );

    // remove enum & clean ENUM type (for PostgreSQL/MySQL compatibility)
    await queryInterface.removeColumn("subscription_plans", "category");

    // If using PostgreSQL, drop ENUM type to avoid leftover type
    if (queryInterface.sequelize.options.dialect === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_subscription_plans_category";'
      );
    }
  },
};
