const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const CouncilInfo = sequelize.define('CouncilInfo', {
  officeHours: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
});

module.exports = CouncilInfo;