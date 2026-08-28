const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const Budget = require('../models/Budget');

// Create or update a budget allocation for a category (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { category, allocated } = req.body;

    const [budget] = await Budget.findOrCreate({
      where: { category },
      defaults: { allocated: allocated || 0 },
    });

    if (allocated !== undefined) {
      budget.allocated = allocated;
      await budget.save();
    }

    res.status(201).json(budget);
  } catch (err) {
    console.error('Error creating/updating budget:', err);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

// Get all budgets (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const budgets = await Budget.findAll();
    res.json(budgets);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

module.exports = router;