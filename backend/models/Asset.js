const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Asset = sequelize.define('Asset', {
  name: { type: DataTypes.STRING, allowNull: false },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  condition: {
    type: DataTypes.STRING,
    defaultValue: 'good',
  },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  installedDate: { type: DataTypes.DATEONLY, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = Asset;