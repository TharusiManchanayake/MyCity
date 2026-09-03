const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const OfficerSchedule = require('../models/OfficerSchedule');

// Get all officer schedules (public)
router.get('/', async (req, res) => {
  try {
    const schedules = await OfficerSchedule.findAll();
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching officer schedules:', err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Add an officer schedule entry (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { officerName, title, meetingDay, timeSlot, notes } = req.body;
    const schedule = await OfficerSchedule.create({ officerName, title, meetingDay, timeSlot, notes });
    res.status(201).json(schedule);
  } catch (err) {
    console.error('Error creating officer schedule:', err);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Delete an officer schedule entry (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const schedule = await OfficerSchedule.findByPk(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    await schedule.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

module.exports = router;