const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Training = sequelize.define('Training', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  trainerId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'trainer_id'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'created_by'
  }
}, {
  tableName: 'trainings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Training;