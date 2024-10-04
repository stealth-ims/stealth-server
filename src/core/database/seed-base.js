/* eslint-disable @typescript-eslint/no-var-requires */
// const Sequelize = require('sequelize');

const baseModelColumns = {
  created_at: new Date(),
  updated_at: new Date(),
};

module.exports = baseModelColumns;

// createdBy: {
//   type: Sequelize.STRING,
//   allowNull: true,
//   field: 'created_by',
// },

//   updatedBy: {
//   type: Sequelize.STRING,
//   allowNull: true,
//   field: 'updated_by',
// },

// deletedAt: {
//   type: Sequelize.DATE,
//   allowNull: true,
//   field: 'deleted_at',
// },

// deletedBy: {
//   type: Sequelize.STRING,
//   allowNull: true,
//   field: 'deleted_by',
// },
