/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const { v4: uuidv4 } = require('uuid');
const baseModelColumns = require('../seed-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const drugCategories = [
      'Analgesics',
      'Antibiotics',
      'Antidepressants',
      'Antidiabetics',
      'Antihistamines',
      'Antihypertensives',
      'Antivirals',
      'Bronchodilators',
      'Corticosteroids',
      'Gastrointestinal',
    ];

    const seedData = drugCategories.map((category) => ({
      id: uuidv4(),
      name: category,
      status: 'ACTIVE',
      ...baseModelColumns,
    }));

    await queryInterface.bulkInsert('drug_categories', seedData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('drug_categories', null, {});
  },
};
