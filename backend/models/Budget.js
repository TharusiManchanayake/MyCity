const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Budget = sequelize.define('Budget', {
  category: { type: DataTypes.STRING, allowNull: false, unique: true },
  allocated: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  spent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
});

module.exports = Budget;