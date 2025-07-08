'use strict';

const faker = require('@faker-js/faker').faker;
const { v4: uuidv4 } = require('uuid');

faker.seed(42);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const items = await queryInterface.sequelize.query(
      'SELECT i.id,i.facility_id,i.selling_price, b.id batchId, b.quantity FROM items i JOIN batches b ON b.item_id = i.id;',
      { type: Sequelize.QueryTypes.SELECT },
    );
    const adminId = (
      await queryInterface.sequelize.query(
        'SELECT id FROM users where email = ? limit 1;',
        {
          replacements: ['example@email.com'],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        },
      )
    )[0]?.id;

    const sales = [];
    const saleItems = [];
    const patients = [];

    for (let s = 0; s < 50; s++) {
      const saleId = uuidv4();
      const lastMonth = Date.UTC(2025, new Date().getMonth() - 1, 1);
      const createdAt = faker.date.between({ from: lastMonth, to: new Date() });
      const updatedAt = faker.date.between({ from: lastMonth, to: new Date() });
      const patientId = uuidv4();
      let total = 0;

      for (let si = 0; si < 5; si++) {
        const item = items[faker.number.int(items.length - 1)];
        total += item.selling_price;
        saleItems.push({
          id: uuidv4(),
          sale_id: saleId,
          item_id: item.id,
          batch_id: item.batchid,
          quantity: faker.number.int(item.quantity % 10) + 1,
          nhis_covered: faker.datatype.boolean(0.3),
          facility_id: item.facility_id,
          created_at: createdAt,
          updated_at: updatedAt,
        });
      }

      if (faker.datatype.boolean(0.7)) {
        patients.push({
          id: patientId,
          card_identification_number: `GHA-${faker.number.int({ min: 100, max: 999 })}-${faker.number.int({ min: 100, max: 999 })}`,
          date_of_birth: faker.date.birthdate(),
          name: faker.person.fullName(),
          created_by_id: adminId,
          created_at: createdAt,
          updated_at: createdAt,
        });
      }

      sales.push({
        id: saleId,
        payment_type: faker.helpers.arrayElements(['ONLINE', 'CASH', 'NHIS'], {
          max: 2,
          min: 1,
        }),
        sale_number: `S-${faker.number.int({ min: 1000, max: 9999 })}`,
        notes: faker.lorem.sentences(2),
        total: total,
        patient_id: patients[faker.number.int(patients.length)]?.id,
        sub_total: total,
        status: 'PAID',
        insured: faker.datatype.boolean(0.3),
        created_at: createdAt,
        updated_at: updatedAt,
      });
    }

    await queryInterface.bulkInsert('patients', patients);
    await queryInterface.bulkInsert('sales', sales);
    await queryInterface.bulkInsert('sale_items', saleItems);
    // await transaction.commit();
    // await queryInterface.commitTransaction(transaction);
  },

  async down(queryInterface, Sequelize) {
    // const transaction = new Sequelize.Transaction();
    await queryInterface.bulkDelete('sale_items');
    await queryInterface.bulkDelete('sales');
    await queryInterface.bulkDelete('patients');
    // await transaction.commit();
  },
};
