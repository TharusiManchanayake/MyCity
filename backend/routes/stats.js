const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const Report = require('../models/Report');
const sequelize = require('../db');

router.get('/', requireAdmin, async (req, res) => {
  try {
    // Count by status
    const statusCounts = await Report.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // Count by category
    const categoryCounts = await Report.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true,
    });

    const total = await Report.count();
    const fixed = await Report.count({ where: { status: 'fixed' } });

    res.json({
      total,
      fixed,
      resolutionRate: total > 0 ? Math.round((fixed / total) * 100) : 0,
      byStatus: statusCounts,
      byCategory: categoryCounts,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;