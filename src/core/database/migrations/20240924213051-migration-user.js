/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';
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
      facility: Sequelize.STRING,
      department: Sequelize.STRING,
      role: Sequelize.STRING,
      password: Sequelize.STRING,
      accountApproved: { type: Sequelize.BOOLEAN, field: 'account_approved' },
      status: Sequelize.STRING,
      deactivatedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'deactivated_by',
      },
      ...baseModelColumns,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
