const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Notification = require('../models/Notification');

// GET /api/notifications - employee sees own, admin sees all
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') filter.to = req.user.id;
    const notes = await Notification.find(filter).sort({ createdAt: -1 }).populate('from', 'name');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notifications - admin sends notification to employee or broadcast (no 'to')
router.post('/', admin, async (req, res) => {
  try {
    const { to, message, meta } = req.body;
    const note = new Notification({ to: to || null, from: req.user.id, message, meta });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
