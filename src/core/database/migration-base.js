/* eslint-disable @typescript-eslint/no-var-requires */
const Sequelize = require('sequelize');

const baseModelColumns = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'created_at',
  },

  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'updated_at',
  },
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
