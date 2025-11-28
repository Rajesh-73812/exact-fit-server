"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "banners", // table name
      "priority", // column name
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        after: "image_url", // place after image_url
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("banners", "priority");
  },
};
