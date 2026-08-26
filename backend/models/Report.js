const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Report = sequelize.define('Report', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING, allowNull: false },
  photoUrl: { type: DataTypes.STRING },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'reported' },
  reporterId: { type: DataTypes.INTEGER },
});

module.exports = Report;
