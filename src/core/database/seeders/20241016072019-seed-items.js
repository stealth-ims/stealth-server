/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const { v4: uuidv4 } = require('uuid');
const baseModelColumns = require('../seed-base.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Get all item categories
    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM item_categories;',
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    // Get all facilities
    const facilities = await queryInterface.sequelize.query(
      'SELECT id, name FROM facilities;',
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const existingUser = await queryInterface.rawSelect(
      'users',
      {
        where: {
          email: 'example@email.com',
        },
      },
      ['id'],
    );

    // Get all suppliers
    const suppliers = await queryInterface.sequelize.query(
      'SELECT id, name FROM suppliers;',
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const items = [];
    const batches = [];

    // Generate 5 items for each category
    for (const category of categories) {
      for (let i = 1; i <= 5; i++) {
        const itemId = uuidv4();
        const randomIndex = Math.floor(Math.random() * facilities.length);
        const facilityId = facilities[randomIndex].id;

        items.push({
          id: itemId,
          name: `${category.name} Item ${i}`,
          brand_name: `Brand ${category.name} ${i}`,
          dosage_form: Math.random() > 0.5 ? 'SOLIDS' : 'LIQUIDS',
          cost_price: parseFloat((Math.random() * 100 + 1).toFixed(2)),
          selling_price: parseFloat((Math.random() * 200 + 50).toFixed(2)),
          code: `${category.name.substring(0, 3).toUpperCase()}${i.toString().padStart(3, '0')}`,
          fda_approval: 'Approved',
          ISO: 'ISO9001',
          manufacturer: `Manufacturer ${Math.floor(Math.random() * 10) + 1}`,
          strength: `${Math.floor(Math.random() * 1000) + 1}mg`,
          unit_of_measurement: Math.random() > 0.5 ? 'tablet' : 'ml',
          storage_req: 'Store in a cool, dry place',
          reorder_point: Math.floor(Math.random() * 100) + 50,
          status: ['LOW', 'STOCKED', 'OUT_OF_STOCK'][
            Math.floor(Math.random() * 3)
          ],
          created_by_id: existingUser,
          category_id: category.id,
          facility_id: facilityId,
          ...baseModelColumns,
        });

        // Generate 3 batches for each item
        for (let j = 1; j <= 3; j++) {
          batches.push({
            id: uuidv4(),
            item_id: itemId,
            validity: new Date(
              new Date().setFullYear(
                new Date().getFullYear() + Math.floor(Math.random() * 5) + 1,
              ),
            ),
            batch_number: `BATCH${itemId.substring(0, 4)}${j}`,
            quantity: Math.floor(Math.random() * 1000) + 100,
            created_by_id: existingUser,
            supplier_id:
              suppliers[Math.floor(Math.random() * suppliers.length)].id,
            ...baseModelColumns,
          });
        }
      }
    }

    // Insert items
    await queryInterface.bulkInsert('items', items, {});

    // Insert batches
    await queryInterface.bulkInsert('batches', batches, {});
  },

  async down(queryInterface) {
    // Delete batches first due to foreign key constraint
    await queryInterface.bulkDelete('batches', null, {});
    // Then delete items
    await queryInterface.bulkDelete('items', null, {});
  },
};
