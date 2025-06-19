/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_adjustments', {
      ...baseModelColumns,
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('REDUCTION', 'INCREMENT'),
        allowNull: false,
      },
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

      // relationships
      itemId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'item_id',
        references: {
          model: 'items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      batchId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'batch_id',
        references: {
          model: 'batches',
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
        allowNull: true,
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
    await queryInterface.removeConstraint(
      'stock_adjustments',
      'stock_adjustments_item_id_fkey',
    );
    await queryInterface.removeConstraint(
      'stock_adjustments',
      'stock_adjustments_batch_id_fkey',
    );
    await queryInterface.removeConstraint(
      'stock_adjustments',
      'stock_adjustments_facility_id_fkey',
    );
    await queryInterface.removeConstraint(
      'stock_adjustments',
      'stock_adjustments_department_id_fkey',
    );
    await queryInterface.dropTable('stock_adjustments');
  },
};
