const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const { requireAdmin, requireAuth, optionalAuth, requireAdminOrTechnician } = require('../middleware/auth');
const Report = require('../models/Report');
const Confirmation = require('../models/Confirmation');
const { suggestCategory } = require('../categorize');

const upload = multer({ storage });

// Create a new report (with photo)
// Create a new report (with photo)
router.post('/', optionalAuth, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;
    const photoUrl = req.file ? req.file.path : null;
    const reporterId = req.user ? req.user.id : null;

    const suggested = suggestCategory(`${title} ${description}`);
    const finalCategory = suggested || category;

    const report = await Report.create({
      title,
      description,
      category: finalCategory,
      photoUrl,
      latitude,
      longitude,
      reporterId,
    });

    res.status(201).json({ ...report.toJSON(), suggestedCategory: suggested, userSelectedCategory: category });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Get all reports (with confirmation counts)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.findAll();

    const reportsWithCounts = await Promise.all(
      reports.map(async (r) => {
        const confirmCount = await Confirmation.count({ where: { reportId: r.id } });
        return { ...r.toJSON(), confirmCount };
      })
    );

    res.json(reportsWithCounts);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Update a report's status (admin only)
router.patch('/:id/status', requireAdminOrTechnician, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = status;
    await report.save();

    res.json(report);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Confirm a report (citizen action)
router.post('/:id/confirm', requireAuth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.reporterId === userId) {
      return res.status(400).json({ error: 'You cannot confirm your own report' });
    }

    const existing = await Confirmation.findOne({ where: { reportId, userId } });
    if (existing) {
      return res.status(400).json({ error: 'You already confirmed this report' });
    }

    await Confirmation.create({ reportId, userId });

    const confirmCount = await Confirmation.count({ where: { reportId } });

    const VERIFY_THRESHOLD = 5;
    if (confirmCount >= VERIFY_THRESHOLD && report.status === 'reported') {
      report.status = 'verified';
      await report.save();
    }

    res.json({ confirmCount, status: report.status });
  } catch (err) {
    console.error('Error confirming report:', err);
    res.status(500).json({ error: 'Failed to confirm report' });
  }
});

module.exports = router;