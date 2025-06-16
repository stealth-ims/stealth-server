'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const baseModelColumns = require('../migration-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('markups', {
      ...baseModelColumns,
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amountType: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'amount_type',
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      batchId: {
        type: Sequelize.UUID,
        references: {
          model: 'batches',
          key: 'id',
        },
        allowNull: false,
        field: 'batch_id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      itemId: {
        type: Sequelize.UUID,
        references: {
          model: 'items',
          key: 'id',
        },
        allowNull: false,
        field: 'item_id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        field: 'created_by_id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      departmentId: {
        type: Sequelize.UUID,
        references: {
          model: 'departments',
          key: 'id',
        },
        field: 'department_id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      facilityId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'facilities',
          key: 'id',
        },
        field: 'facility_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('markups', 'markups_batch_id_fkey');
    await queryInterface.removeConstraint('markups', 'markups_item_id_fkey');
    await queryInterface.removeConstraint(
      'markups',
      'markups_created_by_id_fkey',
    );
    await queryInterface.removeConstraint(
      'markups',
      'markups_department_id_fkey',
    );
    await queryInterface.removeConstraint(
      'markups',
      'markups_facility_id_fkey',
    );
    await queryInterface.dropTable('markups');
  },
};
