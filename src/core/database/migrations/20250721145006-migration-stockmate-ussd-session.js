'use strict';

const { deletedAt, deletedById, ...others } = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stockmate_ussd_sessions', {
      ...others,

      sessionId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'session_id',
      },

      metadata: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ONGOING',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stockmate_ussd_sessions');
  },
};
