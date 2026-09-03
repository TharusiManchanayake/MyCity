const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Ward = sequelize.define('Ward', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  population: { type: DataTypes.INTEGER, allowNull: true },
});

module.exports = Ward;