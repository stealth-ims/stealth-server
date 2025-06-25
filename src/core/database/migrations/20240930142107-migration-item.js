/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create 'items' table
    await queryInterface.createTable('items', {
      ...baseModelColumns,
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      brandName: {
        type: Sequelize.STRING,
        field: 'brand_name',
      },
      dosageForm: {
        type: Sequelize.STRING,
        field: 'dosage_form',
      },
      costPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        field: 'cost_price',
      },
      sellingPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        field: 'selling_price',
      },
      code: {
        type: Sequelize.STRING,
      },
      fdaApproval: {
        type: Sequelize.STRING,
        field: 'fda_approval',
      },
      ISO: {
        type: Sequelize.STRING,
      },
      manufacturer: {
        type: Sequelize.STRING,
      },
      strength: {
        type: Sequelize.STRING,
      },
      unitOfMeasurement: {
        type: Sequelize.STRING,
        field: 'unit_of_measurement',
      },
      storageReq: {
        type: Sequelize.TEXT,
        field: 'storage_req',
      },
      reorderPoint: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'reorder_point',
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'item_categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'category_id',
      },
      facilityId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'facilities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'facility_id',
      },
      departmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
        field: 'department_id',
      },
    });

    // Create 'batches' table
    await queryInterface.createTable('batches', {
      ...baseModelColumns,
      itemId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'items',
          key: 'id',
        },
        field: 'item_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      validity: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      batchNumber: {
        type: Sequelize.STRING,
        field: 'batch_number',
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      supplierId: {
        type: Sequelize.UUID,
        references: {
          model: 'suppliers',
          key: 'id',
        },
        field: 'supplier_id',
      },
      departmentId: {
        type: Sequelize.UUID,
        allowNull: true,
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
    // Drop 'batches' first because it has a foreign key reference to 'items'
    await queryInterface.dropTable('batches');
    // Then drop 'items'
    await queryInterface.dropTable('items');
  },
};
