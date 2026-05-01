const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  participantId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'participant_id'
  },
  trainingId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'training_id'
  },
  status: {
    type: DataTypes.ENUM('ENROLLED', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'ENROLLED'
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  createdAt: 'enrolled_at',
  updatedAt: 'updated_at'
});

module.exports = Enrollment;