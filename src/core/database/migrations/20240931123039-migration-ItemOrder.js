/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';

const baseModelColumns = require('../migration-base.js');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('item_orders', {
      ...baseModelColumns,
      itemId: {
        references: {
          model: 'items',
          key: 'id',
        },
        type: Sequelize.UUID,
        allowNull: false,
        field: 'item_id',
      },
      facilityId: {
        references: {
          model: 'facilities',
          key: 'id',
        },
        allowNull: true,
        type: Sequelize.UUID,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        field: 'facility_id',
      },
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'order_number',
      },
      supplierId: {
        references: {
          model: 'suppliers',
          key: 'id',
        },
        type: Sequelize.UUID,
        allowNull: false,
        field: 'supplier_id',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      expectedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'expected_delivery_date',
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'payment_method',
      },
      deliveryMethod: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'delivery_method',
      },
      deliveryAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'delivery_address',
      },
      additionalNotes: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'additional_notes',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'draft',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('item_orders');
  },
};
