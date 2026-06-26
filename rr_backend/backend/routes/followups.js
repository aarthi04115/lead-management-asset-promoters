const express = require('express');
const router = express.Router();
const FollowUp = require('../models/FollowUp');
const auth = require('../middleware/auth');

// GET /api/followups
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') filter.assignedTo = req.user.id;
    const followups = await FollowUp.find(filter)
      .populate('lead', 'customerName mobile')
      .populate('assignedTo', 'name')
      .sort({ scheduledAt: 1 });
    res.json(followups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/followups
router.post('/', auth, async (req, res) => {
  try {
    const followup = new FollowUp({ ...req.body, assignedTo: req.body.assignedTo || req.user.id });
    await followup.save();
    await followup.populate(['lead', 'assignedTo']);
    res.status(201).json(followup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/followups/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const followup = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('lead', 'customerName').populate('assignedTo', 'name');
    res.json(followup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/followups/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await FollowUp.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
