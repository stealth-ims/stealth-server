/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const { v4: uuidv4 } = require('uuid');
const baseModelColumns = require('../seed-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const suppliers = [
      {
        name: 'Supplier A',
        contact_person: 'John Doe',
        position: 'Sales Manager',
        contact: '+1234567890',
        type: 'Pharmaceutical',
        info: 'Major supplier of generic medications',
      },
      {
        name: 'Supplier B',
        contact_person: 'Jane Smith',
        position: 'Account Executive',
        contact: '+0987654321',
        type: 'Medical Equipment',
        info: 'Specializes in diagnostic equipment',
      },
      // Add more suppliers as needed
    ];

    const seedData = suppliers.map((supplier) => ({
      id: uuidv4(),
      ...supplier,
      ...baseModelColumns,
    }));

    await queryInterface.bulkInsert('suppliers', seedData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('suppliers', null, {});
  },
};
