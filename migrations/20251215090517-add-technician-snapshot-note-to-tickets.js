"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tickets", "technician_id", {
      type: Sequelize.UUID,
      allowNull: true,
      after: "image_url",
    });

    await queryInterface.addColumn("tickets", "snapshot", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "technician_id",
    });

    await queryInterface.addColumn("tickets", "note", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "snapshot",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tickets", "note");
    await queryInterface.removeColumn("tickets", "snapshot");
    await queryInterface.removeColumn("tickets", "technician_id");
  },
};
