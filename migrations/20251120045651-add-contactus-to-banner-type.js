"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("banners", "banner_type", {
      type: Sequelize.ENUM(
        "homepage",
        "category",
        "service",
        "aboutus",
        "contactus"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // ENUM rollback (remove "contactus")
    await queryInterface.changeColumn("banners", "banner_type", {
      type: Sequelize.ENUM("homepage", "category", "service", "aboutus"),
      allowNull: false,
    });
  },
};
