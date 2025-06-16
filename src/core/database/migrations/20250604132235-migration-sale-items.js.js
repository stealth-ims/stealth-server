'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sale_items', {
      ...baseModelColumns,

      saleId: {
        field: 'sale_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sales',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      itemId: {
        field: 'item_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      batchId: {
        field: 'batch_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'batches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
        onDelete: 'SET NULL',
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

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'sale_items',
      'sale_items_item_id_fkey',
    );
    await queryInterface.removeConstraint(
      'sale_items',
      'sale_items_sale_id_fkey',
    );
    await queryInterface.removeConstraint(
      'sale_items',
      'sale_items_batch_id_fkey',
    );
    await queryInterface.removeConstraint(
      'sale_items',
      'sale_items_facility_id_fkey',
    );
    await queryInterface.removeConstraint(
      'sale_items',
      'sale_items_department_id_fkey',
    );
    await queryInterface.dropTable('sale_items');
  },
};
