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
        field: 'brand_trade_name',
      },
      supplierType: {
        type: Sequelize.STRING,
        field: 'supplier_type',
      },
      minimumOrderQuantity: {
        type: Sequelize.INTEGER,
        field: 'minimum_order_quantity',
      },
      leadTime: {
        type: Sequelize.STRING,
        field: 'lead_time',
      },
      deliveryMethod: {
        type: Sequelize.STRING,
        field: 'delivery_method',
      },
      primaryContactName: {
        type: Sequelize.STRING,
        field: 'primary_contact_name',
      },
      jobTitle: {
        type: Sequelize.STRING,
        field: 'job_title',
      },
      department: {
        type: Sequelize.STRING,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'phone_number',
      },
      email: {
        type: Sequelize.STRING,
      },
      physicalAddress: {
        type: Sequelize.STRING,
        field: 'physical_address',
      },
      mailingAddress: {
        type: Sequelize.STRING,
        field: 'mailing_address',
      },
      emergencyContactName: {
        type: Sequelize.STRING,
        field: 'emergency_contact_name',
      },
      emergencyContactTitle: {
        type: Sequelize.STRING,
        field: 'emergency_contact_title',
      },
      emergencyContactNumber: {
        type: Sequelize.STRING,
        field: 'emergency_contact_number',
      },
      paymentType: {
        type: Sequelize.STRING,
        field: 'payment_type',
      },
      currency: {
        type: Sequelize.STRING,
      },
      paymentTerms: {
        type: Sequelize.STRING,
        field: 'payment_terms',
      },
      bankName: {
        type: Sequelize.STRING,
        field: 'bank_name',
      },
      accountType: {
        type: Sequelize.STRING,
        field: 'account_type',
      },
      accountNumber: {
        type: Sequelize.STRING,
        field: 'account_number',
      },
      provider: {
        type: Sequelize.STRING,
      },
      mobileMoneyPhoneNumber: {
        type: Sequelize.STRING,
        field: 'mobile_money_phone_number',
      },
      status: {
        type: Sequelize.ENUM('Active', 'Deactivated'),
        defaultValue: 'Active',
      },
      facilityId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'facility_id',
        references: {
          model: 'facilities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('suppliers');
  },
};
