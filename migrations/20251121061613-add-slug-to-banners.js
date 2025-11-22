"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("banners", "slug", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      after: "name", // Works in MySQL/MariaDB
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("banners", "slug");
  },
};
