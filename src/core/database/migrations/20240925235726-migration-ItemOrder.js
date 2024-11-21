/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';

const baseModelColumns = require('../migration-base.js');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('item_orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      itemName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'item_name',
      },
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'order_number',
      },
      supplier: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expectedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'expected_delivery_name',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'draft', // Default value set to 'draft'
      },
      ...baseModelColumns,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('item_orders');
  },
};
