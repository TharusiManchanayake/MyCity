const express = require('express');
const router = express.Router();
const { requireAdmin, requireAuth } = require('../middleware/auth');
const WorkOrder = require('../models/WorkOrder');
const Report = require('../models/Report');

// Assign a report to a technician (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { reportId, assignedToId, dueDate, notes } = req.body;

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const workOrder = await WorkOrder.create({ reportId, assignedToId, dueDate, notes });

    report.status = 'in_progress';
    await report.save();

    res.status(201).json(workOrder);
  } catch (err) {
    console.error('Error creating work order:', err);
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

// Get all work orders (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const workOrders = await WorkOrder.findAll();
    res.json(workOrders);
  } catch (err) {
    console.error('Error fetching work orders:', err);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// Get work orders assigned to the logged-in technician
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const workOrders = await WorkOrder.findAll({ where: { assignedToId: req.user.id } });

    const withReports = await Promise.all(
      workOrders.map(async (wo) => {
        const report = await Report.findByPk(wo.reportId);
        return { workOrderId: wo.id, dueDate: wo.dueDate, notes: wo.notes, report };
      })
    );

    res.json(withReports);
  } catch (err) {
    console.error('Error fetching technician work orders:', err);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

module.exports = router;