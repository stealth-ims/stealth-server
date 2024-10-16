/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create 'drugs' table
    await queryInterface.createTable('drugs', {
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
        type: Sequelize.ENUM('SOLIDS', 'LIQUIDS'),
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
      status: {
        type: Sequelize.ENUM('LOW', 'STOCKED', 'OUT_OF_STOCK'),
        allowNull: false,
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'created_by',
      },
      updatedBy: {
        type: Sequelize.STRING,
        field: 'updated_by',
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'drug_categories',
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
      drugId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'drugs',
          key: 'id',
        },
        field: 'drug_id',
      },
      validity: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      batchNumber: {
        type: Sequelize.STRING,
        field: 'batch_number',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'created_by',
      },
      deletedAt: {
        type: Sequelize.DATE,
        field: 'deleted_at',
      },
      supplierId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'suppliers',
          key: 'id',
        },
        field: 'supplier_id',
      },
    });
  },

  async down(queryInterface) {
    // Drop 'batches' first because it has a foreign key reference to 'drugs'
    await queryInterface.dropTable('batches');
    // Then drop 'drugs'
    await queryInterface.dropTable('drugs');
  },
};
