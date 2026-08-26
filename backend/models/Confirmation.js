const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Confirmation = sequelize.define('Confirmation', {
  reportId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  indexes: [
    { unique: true, fields: ['reportId', 'userId'] },
  ],
});

module.exports = Confirmation;