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

  createdById: {
    references: {
      model: 'users',
      key: 'id',
    },
    type: Sequelize.UUID,
    field: 'created_by_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },

  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'updated_at',
  },

  updatedById: {
    references: {
      model: 'users',
      key: 'id',
    },
    type: Sequelize.UUID,
    field: 'updated_by_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },

  deletedAt: {
    type: Sequelize.DATE,
    field: 'deleted_at',
  },

  deletedById: {
    references: {
      model: 'users',
      key: 'id',
    },
    type: Sequelize.UUID,
    field: 'deleted_by_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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
