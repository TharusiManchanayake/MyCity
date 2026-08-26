const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const WorkOrder = sequelize.define('WorkOrder', {
  reportId: { type: DataTypes.INTEGER, allowNull: false },
  assignedToId: { type: DataTypes.INTEGER, allowNull: true },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = WorkOrder;