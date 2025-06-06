'use strict';

const faker = require('@faker-js/faker').faker;
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // const transaction = new Sequelize.Transaction();
    // await queryInterface.startTransaction(transaction);

    const items = await queryInterface.sequelize.query(
      'SELECT i.id,i.facility_id,i.selling_price, b.id batchId, b.quantity FROM items i JOIN batches b ON b.item_id = i.id;',
      { type: Sequelize.QueryTypes.SELECT },
    );

    const sales = [];
    const saleItems = [];

    for (let s = 0; s < 50; s++) {
      const saleId = uuidv4();
      const lastMonth = Date.UTC(2025, new Date().getMonth(), 1);
      const createdAt = faker.date.between({ from: lastMonth, to: new Date() });
      const updatedAt = faker.date.between({ from: lastMonth, to: new Date() });
      let total = 0;

      for (let si = 0; si < 5; si++) {
        const item = items[faker.number.int(items.length % 10)];
        total += item.selling_price;
        saleItems.push({
          id: uuidv4(),
          sale_id: saleId,
          item_id: item.id,
          batch_id: item.batchid,
          quantity: faker.number.int(item.quantity % 10) + 1,
          facility_id: item.facility_id,
          created_at: createdAt,
          updated_at: updatedAt,
        });
      }

      sales.push({
        id: saleId,
        payment_type: faker.helpers.arrayElement(['ONLINE', 'CASH']),
        sale_number: `S-${faker.number.int({ min: 1000, max: 9999 })}`,
        notes: faker.lorem.sentences(2),
        total: total,
        sub_total: total,
        status: 'PAID',
        created_at: createdAt,
        updated_at: updatedAt,
      });
    }

    await queryInterface.bulkInsert('sales', sales);
    await queryInterface.bulkInsert('sale_items', saleItems);
    // await transaction.commit();
    // await queryInterface.commitTransaction(transaction);
  },

  async down(queryInterface, Sequelize) {
    // const transaction = new Sequelize.Transaction();
    await queryInterface.bulkDelete('sale_items');
    await queryInterface.bulkDelete('sales');
    // await transaction.commit();
  },
};
