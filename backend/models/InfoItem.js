const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const InfoItem = sequelize.define('InfoItem', {
  title: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true },
});

module.exports = InfoItem;