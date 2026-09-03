const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const Ward = require('../models/Ward');

// Create a ward (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description, population } = req.body;

    const ward = await Ward.create({ name, description, population });
    res.status(201).json(ward);
  } catch (err) {
    console.error('Error creating ward:', err);
    res.status(500).json({ error: 'Failed to create ward' });
  }
});

// Get all wards (public — useful for dropdowns, filters)
router.get('/', async (req, res) => {
  try {
    const wards = await Ward.findAll();
    res.json(wards);
  } catch (err) {
    console.error('Error fetching wards:', err);
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
});

// Delete a ward (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const ward = await Ward.findByPk(req.params.id);
    if (!ward) {
      return res.status(404).json({ error: 'Ward not found' });
    }
    await ward.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting ward:', err);
    res.status(500).json({ error: 'Failed to delete ward' });
  }
});

module.exports = router;