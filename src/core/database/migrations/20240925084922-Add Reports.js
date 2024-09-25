'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const baseModelColumns = require('../migration-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      report_name: {
        type: Sequelize.STRING,
      },
      name_in_export: {
        type: Sequelize.STRING,
      },
      start_date: {
        type: Sequelize.DATE,
      },
      end_date: {
        type: Sequelize.DATE,
      },
      report_layout: {
        type: Sequelize.ENUM('PORTRAIT', 'LANDSCAPE'),
        defaultValue: 'PORTRAIT',
      },
      ...baseModelColumns,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reports');
  },
};
