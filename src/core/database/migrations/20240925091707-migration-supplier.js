/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const baseModelColumns = require('../migration-base');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('suppliers', {
      ...baseModelColumns,
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      brandTradeName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'brand_trade_name',
      },
      supplierType: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'supplier_type',
      },
      minimumOrderQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'minimum_order_quantity',
      },
      leadTime: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'lead_time',
      },
      deliveryMethod: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'delivery_method',
      },
      primaryContactName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'primary_contact_name',
      },
      jobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'job_title',
      },
      department: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'phone_number',
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      physicalAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'physical_address',
      },
      mailingAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'mailing_address',
      },
      emergencyContactName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'emergency_contact_name',
      },
      emergencyContactTitle: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'emergency_contact_title',
      },
      emergencyContactNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'emergency_contact_number',
      },
      paymentType: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'payment_type',
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paymentTerms: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'payment_terms',
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'bank_name',
      },
      accountType: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'account_type',
      },
      accountNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'account_number',
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobileMoneyPhoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'mobile_money_phone_number',
      },
      status: {
        type: Sequelize.ENUM('Active', 'Deactivated'),
        defaultValue: 'Active',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('suppliers');
  },
};
