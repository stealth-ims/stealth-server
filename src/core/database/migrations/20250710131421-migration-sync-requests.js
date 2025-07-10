'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sync_requests', {
      ...baseModelColumns,

      method: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      body: Sequelize.JSONB,

      headers: {
        type: Sequelize.JSONB,
        allowNull: false,
      },

      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      statusCode: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'status_code',
      },

      departmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'department_id',
        references: {
          model: 'departments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      facilityId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'facility_id',
        references: {
          model: 'facilities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sync_requests');
  },
};
