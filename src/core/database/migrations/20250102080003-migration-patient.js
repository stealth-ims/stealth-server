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
