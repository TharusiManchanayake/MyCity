const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const CouncilInfo = require('../models/CouncilInfo');

// Get council info (public — there's only ever one row)
router.get('/', async (req, res) => {
  try {
    let info = await CouncilInfo.findOne();
    if (!info) {
      info = await CouncilInfo.create({});
    }
    res.json(info);
  } catch (err) {
    console.error('Error fetching council info:', err);
    res.status(500).json({ error: 'Failed to fetch council info' });
  }
});

// Update council info (admin only)
router.put('/', requireAdmin, async (req, res) => {
  try {
    const { officeHours, address, phone, email } = req.body;

    let info = await CouncilInfo.findOne();
    if (!info) {
      info = await CouncilInfo.create({});
    }

    info.officeHours = officeHours;
    info.address = address;
    info.phone = phone;
    info.email = email;
    await info.save();

    res.json(info);
  } catch (err) {
    console.error('Error updating council info:', err);
    res.status(500).json({ error: 'Failed to update council info' });
  }
});

module.exports = router;