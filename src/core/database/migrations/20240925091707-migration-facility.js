/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
const baseModelColumns = require('../migration-base.js');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('facilities', {
      ...baseModelColumns,
      name: { type: Sequelize.STRING, unique: true },
      password: { type: Sequelize.STRING },
      region: { type: Sequelize.STRING, allowNull: true },
      location: { type: Sequelize.STRING, allowNull: true },
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
    await queryInterface.removeConstraint('users', 'users_facility_id_fkey');
    await queryInterface.removeColumn('users', 'facility_id');
    await queryInterface.dropTable('facilities');
  },
};
