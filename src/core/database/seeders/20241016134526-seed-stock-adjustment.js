/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const { v4: uuidv4 } = require('uuid');
const baseModelColumns = require('../seed-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Get all drugs
    const drugs = await queryInterface.sequelize.query(
      'SELECT id FROM drugs;',
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    // Get all facilities
    const facilities = await queryInterface.sequelize.query(
      'SELECT id FROM facilities;',
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    // Get all departments
    const departments = await queryInterface.sequelize.query(
      'SELECT id FROM departments;',
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const stockAdjustments = [];

    // Generate 3 stock adjustments for each drug
    for (const drug of drugs) {
      for (let i = 1; i <= 3; i++) {
        const currentStock = Math.floor(Math.random() * 451) + 50; // 50 to 500
        const actualStock = Math.floor(Math.random() * (currentStock + 1)); // 0 to currentStock

        stockAdjustments.push({
          id: uuidv4(),
          reason: `Adjustment reason ${i}`,
          notes: `Detailed notes for adjustment ${i}`,
          status: ['SUBMITTED', 'ADJUSTED', 'REJECTED'][
            Math.floor(Math.random() * 3)
          ],
          type: Math.random() > 0.5 ? 'REDUCTION' : 'INCREMENT',
          created_by: 'System',
          current_stock: currentStock,
          actual_stock: actualStock,
          date_added: new Date(
            new Date().setDate(
              new Date().getDate() - Math.floor(Math.random() * 30),
            ),
          ),
          drug_id: drug.id,
          facility_id:
            facilities[Math.floor(Math.random() * facilities.length)].id,
          department_id:
            departments[Math.floor(Math.random() * departments.length)].id,
          ...baseModelColumns,
        });
      }
    }

    // Insert stock adjustments
    await queryInterface.bulkInsert('stock_adjustments', stockAdjustments, {});
  },

  async down(queryInterface) {
    // Delete stock adjustments
    await queryInterface.bulkDelete('stock_adjustments', null, {});
  },
};
