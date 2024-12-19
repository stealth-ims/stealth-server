'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('department_requests', {
      ...baseModelColumns,

      itemId: {
        type: Sequelize.UUID,
        field: 'item_id',
        allowNull: false,
        references: {
          model: 'items',
          key: 'id',
        },
      },

      facilityId: {
        type: Sequelize.UUID,
        field: 'facility_id',
        allowNull: false,
        references: {
          model: 'facilities',
          key: 'id',
        },
      },

      departmentId: {
        type: Sequelize.UUID,
        field: 'department_id',
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id',
        },
      },

      requestNumber: {
        type: Sequelize.STRING,
        field: 'request_number',
        allowNull: false,
      },

      quantity: {
        type: Sequelize.INTEGER,
        field: 'quantity',
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'DELIVERED', 'CANCELLED'),
        field: 'status',
        allowNull: false,
      },

      additionalNotes: {
        type: Sequelize.TEXT,
        field: 'additional_notes',
        allowNull: true,
      },

      deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DATE,
        allowNull: true,
      },

      deletedBy: {
        field: 'deleted_by',
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, _) {
    await Promise.all([
      await queryInterface.removeConstraint(
        'department_requests',
        'department_requests_facility_id_fkey',
      ),
      await queryInterface.removeConstraint(
        'department_requests',
        'department_requests_department_id_fkey',
      ),

      await queryInterface.removeConstraint(
        'department_requests',
        'department_requests_item_id_fkey',
      ),
    ]);

    await queryInterface.dropTable('department_requests');
  },
};
