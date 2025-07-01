'use strict';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseModelColumns = require('../migration-base.js');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'full_name',
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      phoneNumber: {
        type: Sequelize.STRING,
        field: 'phone_number',
      },

      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      permissions: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      accountActivated: {
        type: Sequelize.BOOLEAN,
        field: 'account_activated',
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      deactivatedBy: {
        type: Sequelize.STRING,
        field: 'deactivated_by',
      },

      deactivatedAt: {
        type: Sequelize.DATE,
        field: 'deactivated_at',
      },

      imageId: {
        type: Sequelize.STRING,
        field: 'image_id',
      },

      imageUrl: {
        type: Sequelize.STRING,
        field: 'image_url',
      },

      resetCode: {
        type: Sequelize.STRING(400),
        field: 'reset_code',
      },

      resetCodeExpires: {
        type: Sequelize.DATE,
        field: 'reset_code_expires',
      },

      ...baseModelColumns,
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('users');
  },
};
