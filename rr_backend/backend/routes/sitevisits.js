const express = require('express');
const router = express.Router();
const SiteVisit = require('../models/SiteVisit');
const auth = require('../middleware/auth');

// GET /api/sitevisits
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') filter.assignedTo = req.user.id;
    const visits = await SiteVisit.find(filter)
      .populate('lead', 'customerName mobile')
      .populate('property', 'name location price')
      .populate('assignedTo', 'name')
      .sort({ scheduledAt: 1 });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/sitevisits
router.post('/', auth, async (req, res) => {
  try {
    const visit = new SiteVisit({ ...req.body, assignedTo: req.body.assignedTo || req.user.id });
    await visit.save();
    await visit.populate(['lead', 'property', 'assignedTo']);
    res.status(201).json(visit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/sitevisits/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const visit = await SiteVisit.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('lead', 'customerName').populate('property', 'name').populate('assignedTo', 'name');
    res.json(visit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/sitevisits/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await SiteVisit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
