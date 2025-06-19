'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
      ...baseModelColumns,

      patientId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'patients',
          key: 'id',
        },
        field: 'patient_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
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

      insured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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
    await queryInterface.removeConstraint('sales', 'sales_patient_id_fkey');
    await queryInterface.removeConstraint('sales', 'sales_facility_id_fkey');
    await queryInterface.removeConstraint('sales', 'sales_department_id_fkey');
    await queryInterface.dropTable('sales');
  },
};
