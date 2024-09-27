/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('suppliers', {
      ...baseModelColumns,
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      contactPerson: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'contact_person',
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      info: {
        type: Sequelize.TEXT,
        field: 'info',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('suppliers');
  },
};
