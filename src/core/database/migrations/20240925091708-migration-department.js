/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
const baseModelColumns = require('../migration-base.js');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('departments', {
      ...baseModelColumns,
      name: { type: Sequelize.STRING },
      facilityId: {
        references: {
          model: 'facilities',
          key: 'id',
        },
        type: Sequelize.UUID,
        field: 'facility_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.addColumn('users', 'department_id', {
      references: {
        model: 'departments',
        key: 'id',
      },
      type: Sequelize.UUID,
      field: 'department_id',
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeConstraint('users', 'users_department_id_fkey');
    await queryInterface.removeColumn('users', 'department_id');
    await queryInterface.removeConstraint(
      'departments',
      'departments_created_by_id_fkey',
    );
    await queryInterface.removeConstraint(
      'departments',
      'departments_updated_by_id_fkey',
    );
    await queryInterface.dropTable('departments');
  },
};
