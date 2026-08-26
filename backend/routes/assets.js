const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const Asset = require('../models/Asset');

// Create an asset (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, type, condition, latitude, longitude, installedDate, notes } = req.body;

    const asset = await Asset.create({
      name,
      type,
      condition: condition || 'good',
      latitude,
      longitude,
      installedDate,
      notes,
    });

    res.status(201).json(asset);
  } catch (err) {
    console.error('Error creating asset:', err);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Get all assets (public — useful for the map)
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.findAll();
    res.json(assets);
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Update an asset's condition (admin only)
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { condition, notes } = req.body;
    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (condition) asset.condition = condition;
    if (notes !== undefined) asset.notes = notes;
    await asset.save();

    res.json(asset);
  } catch (err) {
    console.error('Error updating asset:', err);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// Delete an asset (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    await asset.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting asset:', err);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

module.exports = router;