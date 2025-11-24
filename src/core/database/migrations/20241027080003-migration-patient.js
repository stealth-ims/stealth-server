/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patients', {
      ...baseModelColumns,

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      cardIdentificationNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'card_identification_number',
      },

      secondaryIdentificationNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        field: 'secondary_identification_number',
      },

      queueUniqueId: {
        type: Sequelize.UUID,
        allowNull: true,
        unique: true,
        field: 'queue_unique_id',
      },

      dateOfBirth: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'date_of_birth',
      },

      departmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
        field: 'department_id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      facilityId: {
        type: Sequelize.UUID,
        references: {
          model: 'facilities',
          key: 'id',
        },
        field: 'facility_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeConstraint(
      'patients',
      'patients_created_by_id_fkey',
    );
    await queryInterface.dropTable('patients');
  },
};
