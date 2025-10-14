/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      ...baseModelColumns,
      emailDepartmentRequests: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'email_department_requests',
      },
      emailItemStocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'email_item_stocked',
      },
      emailItemLowStocks: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'email_item_low_stocks',
      },
      emailItemOutOfStock: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'email_item_out_of_stock',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        field: 'user_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeConstraint('settings', 'settings_user_id_fkey');
    await queryInterface.dropTable('settings');
  },
};
