const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const Announcement = require('../models/Announcement');

// Create an announcement (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, message, category, startDate, endDate } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      category: category || 'general',
      startDate,
      endDate,
    });

    res.status(201).json(announcement);
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Get all announcements (public — citizens see these)
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.findAll({ order: [['createdAt', 'DESC']] });
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Delete an announcement (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    await announcement.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;