'use strict';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseModelColumns = require('../migration-base.js');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      fullName: { type: Sequelize.STRING, field: 'full_name' },

      email: {
        type: Sequelize.STRING,
        unique: true,
      },

      phoneNumber: { type: Sequelize.STRING, field: 'phone_number' },

      role: Sequelize.STRING,

      permissions: Sequelize.ARRAY(Sequelize.STRING),

      password: Sequelize.STRING,

      accountActivated: { type: Sequelize.BOOLEAN, field: 'account_activated' },

      status: Sequelize.STRING,

      deactivatedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'deactivated_by',
      },

      deactivatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deactivated_at',
      },
      imageId: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'image_id',
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'image_url',
      },

      resetCode: {
        type: Sequelize.STRING(400),
        allowNull: true,
        field: 'reset_code',
      },

      resetCodeExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'reset_code_expires',
      },

      ...baseModelColumns,

      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'updated_by',
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deleted_at',
      },

      deletedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'deleted_by',
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('users');
  },
};
