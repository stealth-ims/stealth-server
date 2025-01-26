'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('sales', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      field: 'notes',
    });
  },

  async down(queryInterface, _) {
    await queryInterface.changeColumn('sales', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      field: 'notes',
    });
  },
};
