"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "id_proofs", {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "Stores uploaded ID proof URLs",
    });

    await queryInterface.addColumn("users", "service_category", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "services_known", {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "service_type", {
      type: Sequelize.ENUM("general", "emergency"),
      allowNull: true,
    });

    await queryInterface.addColumn("users", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "id_proofs");
    await queryInterface.removeColumn("users", "service_category");
    await queryInterface.removeColumn("users", "services_known");
    await queryInterface.removeColumn("users", "service_type");
    await queryInterface.removeColumn("users", "description");
  },
};
