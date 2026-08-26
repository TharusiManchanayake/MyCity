const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Announcement = sequelize.define('Announcement', {
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'general',
  },
  startDate: { type: DataTypes.DATEONLY, allowNull: true },
  endDate: { type: DataTypes.DATEONLY, allowNull: true },
});

module.exports = Announcement;