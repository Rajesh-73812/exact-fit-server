"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add booking_type after mobile
    await queryInterface.addColumn("bookings", "booking_type", {
      type: Sequelize.ENUM("emergency", "enquiry"),
      allowNull: true,
      after: "mobile",
    });

    // Add technician_id after address_id
    await queryInterface.addColumn("bookings", "technician_id", {
      type: Sequelize.UUID,
      allowNull: true,
      after: "address_id",
    });

    // Add status after description
    await queryInterface.addColumn("bookings", "status", {
      type: Sequelize.ENUM("pending", "active", "cancelled", "completed"),
      allowNull: false,
      defaultValue: "pending",
      after: "description",
    });

    // Add booking_snapshot after status
    await queryInterface.addColumn("bookings", "booking_snapshot", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "status",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn("bookings", "booking_snapshot");
    await queryInterface.removeColumn("bookings", "status");
    await queryInterface.removeColumn("bookings", "technician_id");
    await queryInterface.removeColumn("bookings", "booking_type");

    // Remove ENUM types manually (important for PostgreSQL compatibility)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_bookings_booking_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_bookings_status";'
    );
  },
};
