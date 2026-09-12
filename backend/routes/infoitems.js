const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const InfoItem = require('../models/InfoItem');

// Create an info item (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, details, category } = req.body;
    const item = await InfoItem.create({ title, details, category: category || null });
    res.status(201).json(item);
  } catch (err) {
    console.error('Error creating info item:', err);
    res.status(500).json({ error: 'Failed to create info item' });
  }
});

// Get all info items (public)
router.get('/', async (req, res) => {
  try {
    const items = await InfoItem.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) {
    console.error('Error fetching info items:', err);
    res.status(500).json({ error: 'Failed to fetch info items' });
  }
});

// Update an info item (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, details, category } = req.body;
    const item = await InfoItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Info item not found' });
    }
    item.title = title;
    item.details = details;
    item.category = category || null;
    await item.save();
    res.json(item);
  } catch (err) {
    console.error('Error updating info item:', err);
    res.status(500).json({ error: 'Failed to update info item' });
  }
});

// Delete an info item (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const item = await InfoItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Info item not found' });
    }
    await item.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting info item:', err);
    res.status(500).json({ error: 'Failed to delete info item' });
  }
});

module.exports = router;