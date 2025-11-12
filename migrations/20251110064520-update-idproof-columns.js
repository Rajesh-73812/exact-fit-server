"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Add the new column `id_proof_type`
    await queryInterface.addColumn("technicians", "id_proof_type", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "profile_pic", // optional — adjust based on your column order
    });

    // 2️⃣ Change `id_proofs` column to STRING
    await queryInterface.changeColumn("technicians", "id_proofs", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback actions

    // 1️⃣ Remove the new column
    await queryInterface.removeColumn("technicians", "id_proof_type");

    // 2️⃣ Revert `id_proofs` back to JSON
    await queryInterface.changeColumn("technicians", "id_proofs", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },
};
