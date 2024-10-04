/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const baseModelColumns = require('../seed-base.js');
const { createdAt, updatedAt, ...baseModelColumnsWithoutId } = baseModelColumns;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const adminId = uuidv4();

    const existingFacility = await queryInterface.rawSelect(
      'facilities',
      {
        where: {
          name: 'Facility A',
        },
      },
      ['id'],
    );

    let facilityId;
    if (!existingFacility) {
      facilityId = uuidv4();

      await queryInterface.bulkInsert('facilities', [
        {
          id: facilityId,
          name: 'Facility A',
          region: 'North',
          location: '123 Main St',
          created_by: adminId,
          updated_by: null,
          ...baseModelColumns,
        },
      ]);
    } else {
      facilityId = existingFacility;
    }

    const existingDepartment = await queryInterface.rawSelect(
      'departments',
      {
        where: {
          name: 'Department A',
        },
      },
      ['id'],
    );

    let departmentId;
    if (!existingDepartment) {
      departmentId = uuidv4();

      await queryInterface.bulkInsert('departments', [
        {
          id: departmentId,
          name: 'Department A',
          facility_id: facilityId,
          created_by: adminId,
          updated_by: null,
          ...baseModelColumns,
        },
      ]);
    } else {
      departmentId = existingDepartment;
    }

    const existingUser = await queryInterface.rawSelect(
      'users',
      {
        where: {
          email: 'example@email.com',
        },
      },
      ['id'],
    );

    if (!existingUser) {
      const saltRounds = 10;
      const plainPassword = 'XT(v2EiTqQZ';
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      await queryInterface.bulkInsert('users', [
        {
          id: adminId,
          full_name: 'John Doe',
          email: 'example@email.com',
          phone_number: '0244335567',
          facility_id: facilityId,
          department_id: null,
          role: 'hospital_admin',
          password: hashedPassword,
          account_approved: true,
          status: 'ACTIVE',
          deactivated_by: null,
          deleted_at: null,
          deleted_by: null,
          ...baseModelColumnsWithoutId,
        },
      ]);
    }
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
