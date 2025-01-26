'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
      ...baseModelColumns,

      saleNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'sale_number',
      },

      paymentType: {
        type: Sequelize.ENUM('CASH', 'ONLINE'),
        allowNull: false,
        field: 'payment_type',
      },

      saleItems: {
        type: Sequelize.ARRAY(Sequelize.JSONB),
        allowNull: false,
        field: 'sale_items',
      },

      subTotal: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        field: 'sub_total',
      },

      total: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        field: 'total',
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'notes',
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

      departmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'department_id',
        references: {
          model: 'departments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      facilityId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'facility_id',
        references: {
          model: 'facilities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface, _) {
    await queryInterface.removeConstraint('sales', 'sales_facility_id_fkey');
    await queryInterface.removeConstraint('sales', 'sales_department_id_fkey');
    await queryInterface.dropTable('sales');
  },
};
