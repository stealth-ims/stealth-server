/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const baseModelColumns = require('../seed-base.js');
const { createdAt, updatedAt, ...baseModelColumnsWithoutId } = baseModelColumns;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    let existingUser = (
      await queryInterface.sequelize.query(
        'SELECT id FROM users where email = ?;',
        {
          replacements: ['example@email.com'],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        },
      )
    )[0]?.id;

    if (!existingUser) {
      existingUser = uuidv4();
      const saltRounds = 10;
      const plainPassword = 'XT(v2EiTqQZ';
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      await queryInterface.bulkInsert('users', [
        {
          id: existingUser,
          full_name: 'Jack Frost',
          username: 'example',
          email: 'example@email.com',
          phone_number: '0244335561',
          // facility_id: facilityId,
          department_id: null,
          role: 'Central Admin',
          permissions: [
            'items:READ_WRITE_DELETE',
            'item_categories:READ_WRITE_DELETE',
            'stock_adjustment:READ_WRITE_DELETE',
            'item_orders:READ_WRITE_DELETE',
            'reports:READ_WRITE_DELETE',
            'suppliers:READ_WRITE_DELETE',
            'sales:READ_WRITE_DELETE',
            'department_requests:READ_WRITE_DELETE',
            'departments:READ_WRITE_DELETE',
            'users:READ_WRITE_DELETE',
          ],
          password: hashedPassword,
          account_activated: true,
          status: 'Active',
          deactivated_by: null,
          deleted_at: null,
          deleted_by_id: null,
          ...baseModelColumnsWithoutId,
        },
      ]);
    }

    let existingFacility = (
      await queryInterface.sequelize.query(
        'SELECT id FROM facilities where name = ?;',
        {
          replacements: ['Facility A'],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        },
      )
    )[0]?.id;

    if (!existingFacility) {
      existingFacility = uuidv4();

      await queryInterface.bulkInsert('facilities', [
        {
          id: existingFacility,
          name: 'Facility A',
          region: 'North',
          location: '123 Main St',
          created_by_id: existingUser,
          updated_by_id: null,
          ...baseModelColumns,
        },
      ]);
    }

    let existingDepartment = (
      await queryInterface.sequelize.query(
        'SELECT id FROM departments where name = ?;',
        {
          replacements: ['Department A'],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        },
      )
    )[0]?.id;

    if (!existingDepartment) {
      existingDepartment = uuidv4();

      await queryInterface.bulkInsert('departments', [
        {
          id: existingDepartment,
          name: 'Department A',
          facility_id: existingFacility,
          created_by_id: existingUser,
          updated_by_id: null,
          ...baseModelColumns,
        },
      ]);
    }

    await queryInterface.bulkUpdate(
      'users',
      {
        facility_id: existingFacility,
      },
      { email: 'example@email.com' },
    );
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'example@email.com',
    });
    await queryInterface.bulkDelete('departments', {
      name: ['Department A'],
    });
    await queryInterface.bulkDelete('facilities', {
      name: ['Facility A'],
    });
  },
};
