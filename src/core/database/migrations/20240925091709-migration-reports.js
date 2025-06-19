'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const baseModelColumns = require('../migration-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      ...baseModelColumns,
      reportType: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'report_type',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nameInExport: {
        field: 'name_in_export',
        allowNull: true,
        type: Sequelize.STRING,
      },
      startDate: {
        field: 'start_date',
        allowNull: true,
        type: Sequelize.DATE,
      },
      endDate: {
        field: 'end_date',
        allowNull: true,
        type: Sequelize.DATE,
      },
      specificDate: {
        field: 'specific_date',
        allowNull: true,
        type: Sequelize.DATE,
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
      facilityId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'facilities',
          key: 'id',
        },
        field: 'facility_id',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'reports',
      'reports_department_id_fkey',
    );
    await queryInterface.removeConstraint(
      'reports',
      'reports_facility_id_fkey',
    );
    await queryInterface.dropTable('reports');
  },
};
