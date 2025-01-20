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

    const facilities = await queryInterface.sequelize.query(
      'SELECT id, name FROM facilities',
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const seedData = itemCategories.map((category) => ({
      id: uuidv4(),
      name: category,
      status: 'ACTIVE',
      facility_id: facilities[0].id,
      ...baseModelColumns,
    }));

    await queryInterface.bulkInsert('item_categories', seedData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('item_categories', null, {});
  },
};
