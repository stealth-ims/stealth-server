'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      report_name: {
        type: Sequelize.STRING,
      },
      name_in_export: {
        type: Sequelize.STRING,
      },
      start_date: {
        type: Sequelize.DATE,
      },
      end_date: {
        type: Sequelize.DATE,
      },
      report_layout: {
        type: Sequelize.ENUM('PORTRAIT', 'LANDSCAPE'),
        defaultValue: 'PORTRAIT',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      created_by: {
        type: Sequelize.STRING,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updated_by: {
        type: Sequelize.STRING,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
      deleted_by: {
        type: Sequelize.STRING,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reports');
  },
};
