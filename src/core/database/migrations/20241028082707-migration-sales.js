'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
      ...baseModelColumns,

      itemId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'item_id',
        references: {
          model: 'items',
          key: 'id',
        },
      },

      patientName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'patient_name',
      },

      saleNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'sale_number',
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'quantity',
      },

      status: {
        type: Sequelize.ENUM('PAID', 'UNPAID'),
        allowNull: false,
        field: 'status',
      },

      deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DATE,
        allowNull: true,
      },

      deletedBy: {
        field: 'deleted_by',
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, _) {
    await queryInterface.removeConstraint('sales', 'sales_item_id_fkey');
    await queryInterface.dropTable('sales');
  },
};
