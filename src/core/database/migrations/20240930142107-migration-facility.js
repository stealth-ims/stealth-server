/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
const baseModelColumns = require('../migration-base.js');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('facilities', {
      ...baseModelColumns,
      name: { type: Sequelize.STRING },
      region: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'created_by',
      },

      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'updated_by',
      },
    });

    await queryInterface.addColumn('users', 'facility_id', {
      allowNull: true,
      references: {
        model: 'facilities',
        key: 'id',
      },
      type: Sequelize.UUID,
      field: 'facility_id',
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('facilities');
    await queryInterface.removeColumn('users', 'facility_id');
  },
};
