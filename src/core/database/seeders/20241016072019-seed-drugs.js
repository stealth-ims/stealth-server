/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const { v4: uuidv4 } = require('uuid');
const baseModelColumns = require('../seed-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Seed drugs
    const drugs = [
      {
        name: 'Paracetamol',
        brand_name: 'Tylenol',
        dosage_form: 'SOLIDS',
        cost_price: 5.0,
        selling_price: 7.5,
        code: 'PARA001',
        fda_approval: 'Approved',
        ISO: 'ISO9001',
        manufacturer: 'Johnson & Johnson',
        strength: '500mg',
        unit_of_measurement: 'tablet',
        storage_req: 'Store in a cool, dry place',
        reorder_point: 100,
        status: 'STOCKED',
        category_id: await queryInterface.rawSelect(
          'drug_categories',
          { where: { name: 'Analgesics' } },
          ['id'],
        ),
        facility_id: await queryInterface.rawSelect(
          'facilities',
          { where: { name: 'Facility A' } },
          ['id'],
        ),
      },
      // Add more drugs as needed
    ];

    const seedDrugs = drugs.map((drug) => ({
      id: uuidv4(),
      ...drug,
      ...baseModelColumns,
    }));

    await queryInterface.bulkInsert('drugs', seedDrugs, {});

    // Seed batches
    const batches = [
      {
        drug_id: seedDrugs[0].id,
        validity: new Date('2025-12-31'),
        batch_number: 'BATCH001',
        quantity: 1000,
        supplier_id: await queryInterface.rawSelect(
          'suppliers',
          { where: { name: 'Supplier A' } },
          ['id'],
        ),
      },
      // Add more batches as needed
    ];

    const seedBatches = batches.map((batch) => ({
      id: uuidv4(),
      ...batch,
      ...baseModelColumns,
    }));

    await queryInterface.bulkInsert('batches', seedBatches, {});
  },

  async down(queryInterface) {
    // Delete batches first due to foreign key constraint
    await queryInterface.bulkDelete('batches', null, {});
    // Then delete drugs
    await queryInterface.bulkDelete('drugs', null, {});
  },
};
