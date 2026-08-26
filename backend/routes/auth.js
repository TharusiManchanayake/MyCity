const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');

// Sign up (creates a user with a given role)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'citizen',
    });

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all technicians (admin only)
router.get('/technicians', requireAdmin, async (req, res) => {
  try {
    const technicians = await User.findAll({
      where: { role: 'technician' },
      attributes: ['id', 'name', 'email'],
    });
    res.json(technicians);
  } catch (err) {
    console.error('Error fetching technicians:', err);
    res.status(500).json({ error: 'Failed to fetch technicians' });
  }
});

module.exports = router;