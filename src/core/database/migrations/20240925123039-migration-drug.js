/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create 'drugs' table with a reference to 'drug_categories'
    await queryInterface.createTable('drugs', {
      ...baseModelColumns,
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
      dosageForm: {
        type: Sequelize.ENUM('SOLIDS', 'LIQUIDS'),
        field: 'dosage_form',
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      validity: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      fdaApproval: {
        type: Sequelize.STRING,
        field: 'fda_approval',
      },
      ISO: {
        type: Sequelize.STRING,
      },
      batch: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reorderPoint: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'reorder_point',
      },
      manufacturer: {
        type: Sequelize.STRING,
        allowNull: false,
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
      status: {
        type: Sequelize.ENUM('LOW', 'STOCKED', 'OUT_OF_STOCK'),
        allowNull: false,
      },
      storageReq: {
        type: Sequelize.TEXT,
        field: 'storage_req',
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
    });
  },

  async down(queryInterface) {
    // Drop 'drugs' first because it has a foreign key reference
    await queryInterface.dropTable('drugs');
  },
};
