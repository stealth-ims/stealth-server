/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const { v4: uuidv4 } = require('uuid');
const baseModelColumns = require('../seed-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const itemCategories = [
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

    const seedData = itemCategories.map((category) => ({
      id: uuidv4(),
      name: category,
      status: 'ACTIVE',
      ...baseModelColumns,
    }));

    await queryInterface.bulkInsert('item_categories', seedData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('item_categories', null, {});
  },
};
