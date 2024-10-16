/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_adjustments', {
      ...baseModelColumns,
      reason: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('SUBMITTED', 'ADJUSTED', 'REJECTED'),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('REDUCTION', 'INCREMENT'),
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'created_by',
      },
      currentStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'current_stock',
      },
      actualStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'actual_stock',
      },
      dateAdded: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'date_added',
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deleted_at',
      },

      // relationships
      drugId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'drug_id',
        references: {
          model: 'drugs',
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

      departmentId: {
        type: Sequelize.UUID,
        field: 'department_id',
        references: {
          model: 'departments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stock_adjustments');
  },
};
