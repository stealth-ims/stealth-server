'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // make name column in drugs table not unique
    await queryInterface.changeColumn('drugs', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });
    await queryInterface.addColumn('drugs', 'facility_id', {
      references: {
        model: 'facilities',
        key: 'id',
      },
      type: Sequelize.UUID,
      field: 'facility_id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('drugs', 'department_id', {
      references: {
        model: 'departments',
        key: 'id',
      },
      type: Sequelize.UUID,
      field: 'department_id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    // make name column in drugs table unique
    await queryInterface.changeColumn('drugs', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
    await queryInterface.removeColumn('drugs', 'facility_id');
    await queryInterface.removeColumn('drugs', 'department_id');
  },
};
