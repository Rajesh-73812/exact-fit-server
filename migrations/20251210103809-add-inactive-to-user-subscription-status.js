'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('user_subscriptions', 'status', {
      type: Sequelize.ENUM('active', 'expired', 'cancelled', 'pending', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    });
  },

  async down(queryInterface, Sequelize) {
    // revert to old ENUM
    await queryInterface.changeColumn('user_subscriptions', 'status', {
      type: Sequelize.ENUM('active', 'expired', 'cancelled', 'pending'),
      allowNull: false,
      defaultValue: 'active',
    });
  }
};
