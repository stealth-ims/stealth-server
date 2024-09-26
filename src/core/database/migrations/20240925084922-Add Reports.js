'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const baseModelColumns = require('../migration-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      reportName: {
        field: 'report_name',
        type: Sequelize.STRING,
      },
      nameInExport: {
        field: 'name_in_export',
        type: Sequelize.STRING,
      },
      startDate: {
        field: 'start_date',
        type: Sequelize.DATE,
      },
      endDate: {
        field: 'end_date',
        type: Sequelize.DATE,
      },
      reportLayout: {
        field: 'report_layout',
        type: Sequelize.ENUM('PORTRAIT', 'LANDSCAPE'),
        defaultValue: 'PORTRAIT',
      },

      deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deleted_at',
      },

      deletedBy: {
        field: 'deleted_by',
        type: Sequelize.STRING,
        allowNull: true,
        field: 'deleted_by',
      },

      ...baseModelColumns,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reports');
  },
};
