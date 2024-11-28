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
        brand_trade_name: 'PharmaGen',
        supplier_type: 'Pharmaceutical',
        minimum_order_quantity: 100,
        lead_time: '2 weeks',
        delivery_method: 'Courier',
        primary_contact_name: 'John Doe',
        job_title: 'Sales Manager',
        department: 'Sales',
        phone_number: '+233506422626',
        email: 'johndoe@pharmagen.com',
        physical_address: '45 Kofi Annan St, Accra, Ghana',
        mailing_address: 'P.O. Box 123, City',
        emergency_contact_name: 'Sadie Saori',
        emergency_contact_title: 'Procurement Officer',
        emergency_contact_number: '+23355677954',
        payment_type: 'Bank',
        currency: 'USD',
        payment_terms: 'Net 30',
        bank_name: 'National Bank',
        account_type: 'Savings',
        account_number: '123456789',
        provider: null,
        mobile_money_phone_number: null,
      },
      {
        name: 'Supplier B',
        brand_trade_name: 'MediTech',
        supplier_type: 'Medical Equipment',
        minimum_order_quantity: 50,
        lead_time: '1 month',
        delivery_method: 'Freight',
        primary_contact_name: 'Jane Smith',
        job_title: 'Account Executive',
        department: 'Accounts',
        phone_number: '+233279843857',
        email: 'janesmith@meditech.com',
        physical_address: '30 Jumbo St, Koforidua, Ghana',
        mailing_address: 'P.O. Box 456, City',
        emergency_contact_name: 'James Ofori',
        emergency_contact_title: 'Sales Manager',
        emergency_contact_number: '+23355677835',
        payment_type: 'Mobile Money',
        currency: 'GHS',
        payment_terms: 'Net 60',
        bank_name: null,
        account_type: null,
        account_number: null,
        provider: 'MTN',
        mobile_money_phone_number: '+233552985678',
      },
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
