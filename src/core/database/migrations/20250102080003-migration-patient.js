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
        allowNull: false,
        unique: true,
        field: 'card_identification_number',
      },

      dateOfBirth: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'date_of_birth',
      },

      createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'created_by',
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deleted_at',
      },

      deletedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'deleted_by',
      },
    });

    await queryInterface.addColumn('sales', 'patient_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'patients',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeConstraint('sales', 'sales_patient_id_fkey');
    await queryInterface.removeColumn('sales', 'patient_id');
    await queryInterface.dropTable('patients');
  },
};
