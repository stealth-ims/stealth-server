'use strict';

const faker = require('@faker-js/faker').faker;
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.startTransaction();

    const items = await queryInterface.sequelize.query(
      'SELECT i.id,i.facility_id,i.selling_price, b.id batchId, b.quantity FROM items i JOIN batches b ON b.item_id = i.id;',
      { type: Sequelize.QueryTypes.SELECT },
    );

    const sales = [];
    const saleItems = [];

    for (s = 0; s < 50; s++) {
      const saleId = uuidv4();
      const lastMonth = new Date.UTC(2025, new Date().getMonth(), 1);
      let total = 0;

      for (si = 0; s < 5; s++) {
        const item = items[faker.number.int(items.length - 1)];
        total += item.selling_price;
        saleItems.push({
          id: uuidv4(),
          sale_id: saleId,
          item_id: item.id,
          batch_id: item.batchId,
          quantity: faker.number.int(item.quantity % 10),
          facility_id: item.facility_id,
        });
      }

      sales.push({
        id: saleId,
        payment_type: faker.helpers.arrayElement(['ONLINE', 'CASH']),
        sale_number: `S-${faker.number.int({ min: 1000, max: 9999 })}`,
        notes: faker.lorem.sentences(2),
        total: total,
        status: 'PAID',
        created_at: faker.date.between({ from: lastMonth, to: new Date() }),
      });
    }

    await queryInterface.bulkInsert('sales', sales, {});
    await queryInterface.bulkInsert('sale_items', saleItems, {});
    await queryInterface.commitTransaction();
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.startTransaction();
    await queryInterface.bulkDelete('sale_items');
    await queryInterface.bulkDelete('sales');
    await queryInterface.commitTransaction();
  },
};
