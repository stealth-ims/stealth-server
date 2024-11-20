/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create 'item_categories' table
    await queryInterface.createTable('item_categories', {
      ...baseModelColumns,
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'DEACTIVATED'),
        defaultValue: 'ACTIVE',
      },
    });
  },

  async down(queryInterface) {
    // Drop 'item_categories'
    await queryInterface.dropTable('item_categories');
  },
};
