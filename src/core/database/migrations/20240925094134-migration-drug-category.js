/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create 'drug_categories' table
    await queryInterface.createTable('drug_categories', {
      ...baseModelColumns,
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'DEACTIVATED'),
        defaultValue: 'ACTIVE',
      },
      drugCount: {
        type: Sequelize.INTEGER,
        get: async () => {
          return await Sequelize.Model.count(
            'drugs',
            where({ category_id: this.id }),
          );
        },
        field: 'drug_count',
      },
    });
  },

  async down(queryInterface) {
    // Drop 'drug_categories'
    await queryInterface.dropTable('drug_categories');
  },
};
