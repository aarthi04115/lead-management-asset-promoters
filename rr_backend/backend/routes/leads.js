const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const User = require('../models/User');
const RoundRobin = require('../models/RoundRobin');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const AssignmentHistory = require('../models/AssignmentHistory');
const Notification = require('../models/Notification');

// Round Robin assignment helper
async function assignNextEmployee() {
  const activeEmployees = await User.find({ role: 'employee', status: 'Active' }).sort({ employeeId: 1 });
  if (activeEmployees.length === 0) return null;

  let rrState = await RoundRobin.findOne();
  if (!rrState) {
    rrState = new RoundRobin({ currentIndex: 0 });
  }

  const assignedEmployee = activeEmployees[rrState.currentIndex % activeEmployees.length];

  // Advance index
  rrState.currentIndex = (rrState.currentIndex + 1) % activeEmployees.length;
  rrState.lastUpdated = new Date();
  await rrState.save();

  return assignedEmployee._id;
}

// GET /api/leads
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    // Employees only see their own leads
    if (req.user.role === 'employee') filter.assignedTo = req.user.id;

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name employeeId')
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/leads/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name employeeId title');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leads - create with auto Round Robin assignment
// Admin-only create (manual entry)
router.post('/', admin, async (req, res) => {
  try {
    const { customerName, mobile, email, source, intent, priority, notes } = req.body;

    // Auto-assign via Round Robin
    const assignedTo = await assignNextEmployee();

    const lead = new Lead({
      customerName, mobile, email, source, intent, priority, notes,
      assignedTo,
      score: Math.floor(Math.random() * 30) + 50 // Base score 50-80
    });
    await lead.save();
    await lead.populate('assignedTo', 'name employeeId');

    // Record assignment history
    if (assignedTo) {
      await AssignmentHistory.create({ leadId: lead._id, to: assignedTo, assignedBy: req.user.id });
    }

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public endpoint to create leads (e.g., Website Forms, Ads) without authentication
router.post('/public', async (req, res) => {
  try {
    const { customerName, mobile, email, source, intent, priority, notes } = req.body;
    const assignedTo = await assignNextEmployee();
    const lead = new Lead({ customerName, mobile, email, source, intent, priority, notes, assignedTo });
    await lead.save();
    await lead.populate('assignedTo', 'name employeeId');
    if (assignedTo) {
      await AssignmentHistory.create({ leadId: lead._id, to: assignedTo });
    }
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/leads/:id - update lead
// PUT /api/leads/:id - update lead (admin for assignment changes)
router.put('/:id', auth, async (req, res) => {
  try {
    const prev = await Lead.findById(req.params.id);
    if (!prev) return res.status(404).json({ message: 'Lead not found' });

    // If assignedTo is changing, only admin can change
    if (req.body.assignedTo && String(prev.assignedTo) !== String(req.body.assignedTo)) {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can reassign leads' });
      // record history
      await AssignmentHistory.create({ leadId: prev._id, from: prev.assignedTo, to: req.body.assignedTo, assignedBy: req.user.id });
      // send notification to new assignee
      await Notification.create({ to: req.body.assignedTo, from: req.user.id, message: `You have been assigned lead ${prev.customerName}` });
    }

    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name employeeId');
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leads/:id/reassign - admin reassign endpoint
router.post('/:id/reassign', admin, async (req, res) => {
  try {
    const { toEmployeeId } = req.body; // expects user _id
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    const toUser = await User.findById(toEmployeeId);
    if (!toUser) return res.status(404).json({ message: 'Employee not found' });

    const from = lead.assignedTo;
    lead.assignedTo = toUser._id;
    await lead.save();

    await AssignmentHistory.create({ leadId: lead._id, from, to: toUser._id, assignedBy: req.user.id });
    await Notification.create({ to: toUser._id, from: req.user.id, message: `You have been reassigned lead ${lead.customerName}` });

    await lead.populate('assignedTo', 'name employeeId');
    res.json({ message: 'Reassigned', lead });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/leads/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/leads/stats/distribution - Round Robin distribution stats
router.get('/stats/distribution', auth, async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'employee' } },
      { $unwind: '$employee' },
      { $project: { name: '$employee.name', employeeId: '$employee.employeeId', count: 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
