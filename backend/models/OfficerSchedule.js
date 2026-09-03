const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OfficerSchedule = sequelize.define('OfficerSchedule', {
  officerName: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  meetingDay: { type: DataTypes.STRING, allowNull: false },
  timeSlot: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = OfficerSchedule;