const express = require('express');
const router = express.Router();
const RoundRobin = require('../models/RoundRobin');
const User = require('../models/User');
const Lead = require('../models/Lead');
const AssignmentHistory = require('../models/AssignmentHistory');
const Notification = require('../models/Notification');
const { protect: auth, authorizeRoles } = require('../middleware/authMiddleware');
const admin = authorizeRoles('admin');

// ========== ROUND ROBIN ASSIGNMENT FUNCTIONS ==========

// Simple Round Robin - Basic cyclic assignment
async function simpleRoundRobinAssign() {
  const activeEmployees = await User.find({ role: 'employee', status: 'Active' })
    .sort({ employeeId: 1 });

  if (activeEmployees.length === 0) return null;

  let rrState = await RoundRobin.findOne();
  if (!rrState) {
    rrState = new RoundRobin({
      currentIndex: 0,
      activeEmployees: activeEmployees.map(e => e._id)
    });
  }

  const assignedEmployee = activeEmployees[rrState.currentIndex % activeEmployees.length];

  rrState.currentIndex = (rrState.currentIndex + 1) % activeEmployees.length;
  rrState.totalAssignments += 1;
  rrState.lastUpdated = new Date();
  await rrState.save();

  return assignedEmployee._id;
}

// Load Balanced Round Robin - Assigns to employee with least leads
async function loadBalancedRoundRobin() {
  const activeEmployees = await User.find({ role: 'employee', status: 'Active' });

  if (activeEmployees.length === 0) return null;

  // Get lead count for each employee
  const employeesWithLeadCount = await Promise.all(
    activeEmployees.map(async (emp) => ({
      employeeId: emp._id,
      leadCount: await Lead.countDocuments({ assignedTo: emp._id, status: { $ne: 'Closed', $ne: 'Lost' } })
    }))
  );

  // Find employee with minimum leads
  const assignedEmployee = employeesWithLeadCount.reduce((min, curr) =>
    curr.leadCount < min.leadCount ? curr : min
  );

  let rrState = await RoundRobin.findOne();
  if (!rrState) {
    rrState = new RoundRobin({ assignmentMethod: 'load_balanced' });
  }

  rrState.totalAssignments += 1;
  rrState.lastUpdated = new Date();
  await rrState.save();

  return assignedEmployee.employeeId;
}

// Score-based assignment - Assigns to highest performing employee within rotation
async function scoreBasedRoundRobin() {
  const activeEmployees = await User.find({ role: 'employee', status: 'Active' })
    .sort({ score: -1, employeeId: 1 });

  if (activeEmployees.length === 0) return null;

  // Get top 3 employees by score and rotate among them
  const topEmployees = activeEmployees.slice(0, Math.min(3, activeEmployees.length));

  let rrState = await RoundRobin.findOne();
  if (!rrState) {
    rrState = new RoundRobin({
      assignmentMethod: 'score_based',
      currentIndex: 0
    });
  }

  const assignedEmployee = topEmployees[rrState.currentIndex % topEmployees.length];

  rrState.currentIndex = (rrState.currentIndex + 1) % topEmployees.length;
  rrState.totalAssignments += 1;
  rrState.lastUpdated = new Date();
  await rrState.save();

  return assignedEmployee._id;
}

// ========== ROUTE ENDPOINTS ==========

// GET /api/roundrobin/status - Get current round robin status
router.get('/status', auth, admin, async (req, res) => {
  try {
    let rrState = await RoundRobin.findOne().populate('activeEmployees', 'name employeeId score');

    if (!rrState) {
      rrState = new RoundRobin();
      await rrState.save();
    }

    const activeEmployees = await User.find({ role: 'employee', status: 'Active' });

    // Get assignment stats for each employee
    const stats = await Promise.all(
      activeEmployees.map(async (emp) => ({
        employeeId: emp._id,
        name: emp.name,
        email: emp.email,
        score: emp.score,
        assignedLeads: await Lead.countDocuments({ assignedTo: emp._id, status: { $ne: 'Closed', $ne: 'Lost' } }),
        closedLeads: await Lead.countDocuments({ assignedTo: emp._id, status: 'Closed' }),
        totalAssignments: await Lead.countDocuments({ assignedTo: emp._id })
      }))
    );

    res.json({
      status: 'active',
      assignmentMethod: rrState.assignmentMethod,
      currentIndex: rrState.currentIndex,
      totalAssignments: rrState.totalAssignments,
      lastUpdated: rrState.lastUpdated,
      lastReset: rrState.lastReset,
      employeeCount: activeEmployees.length,
      employeeStats: stats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/roundrobin/assign - Assign a lead using round robin
router.post('/assign', admin, async (req, res) => {
  try {
    const { leadId, method } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    let assignmentMethod = method || 'round_robin';
    let assignedEmployeeId;

    // Select assignment method
    switch (assignmentMethod) {
      case 'load_balanced':
        assignedEmployeeId = await loadBalancedRoundRobin();
        break;
      case 'score_based':
        assignedEmployeeId = await scoreBasedRoundRobin();
        break;
      case 'round_robin':
      default:
        assignedEmployeeId = await simpleRoundRobinAssign();
        assignmentMethod = 'round_robin';
    }

    if (!assignedEmployeeId) {
      return res.status(400).json({ message: 'No active employees available for assignment' });
    }

    // Assign lead to employee
    lead.assignedTo = assignedEmployeeId;
    await lead.save();
    await lead.populate('assignedTo', 'name employeeId email');

    // Record assignment history
    if (typeof AssignmentHistory !== 'undefined') {
      await AssignmentHistory.create({
        leadId: lead._id,
        to: assignedEmployeeId,
        assignedBy: req.user?._id || null,
        note: `Assigned via ${assignmentMethod}`
      });
    }

    // Create notification for employee
    if (typeof Notification !== 'undefined') {
      await Notification.create({
        to: assignedEmployeeId,
        message: `New lead assigned: ${lead.customerName}`,
        meta: { leadId: lead._id, type: 'lead_assigned' }
      });
    }

    res.json({
      success: true,
      message: `Lead assigned via ${assignmentMethod}`,
      lead: lead,
      assignedEmployee: lead.assignedTo
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/roundrobin/assign-bulk - Assign multiple leads
router.post('/assign-bulk', admin, async (req, res) => {
  try {
    const { leadIds, method } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: 'leadIds array required' });
    }

    let assignmentMethod = method || 'round_robin';
    const assignedLeads = [];
    const failedLeads = [];

    for (const leadId of leadIds) {
      try {
        const lead = await Lead.findById(leadId);
        if (!lead) {
          failedLeads.push({ leadId, reason: 'Lead not found' });
          continue;
        }

        let assignedEmployeeId;
        switch (assignmentMethod) {
          case 'load_balanced':
            assignedEmployeeId = await loadBalancedRoundRobin();
            break;
          case 'score_based':
            assignedEmployeeId = await scoreBasedRoundRobin();
            break;
          case 'round_robin':
          default:
            assignedEmployeeId = await simpleRoundRobinAssign();
        }

        if (!assignedEmployeeId) {
          failedLeads.push({ leadId, reason: 'No active employees' });
          continue;
        }

        lead.assignedTo = assignedEmployeeId;
        await lead.save();

        // Record assignment history
        if (typeof AssignmentHistory !== 'undefined') {
          await AssignmentHistory.create({
            leadId: lead._id,
            to: assignedEmployeeId,
            assignedBy: req.user?._id || null,
            note: `Bulk assigned via ${assignmentMethod}`
          });
        }

        // Create notification
        if (typeof Notification !== 'undefined') {
          await Notification.create({
            to: assignedEmployeeId,
            message: `Bulk leads assigned: ${lead.customerName}`,
            meta: { leadId: lead._id, type: 'bulk_leads_assigned' }
          });
        }

        assignedLeads.push({
          leadId: lead._id,
          customerName: lead.customerName,
          assignedTo: assignedEmployeeId
        });
      } catch (innerErr) {
        failedLeads.push({ leadId, reason: innerErr.message });
      }
    }

    res.json({
      success: true,
      totalLeads: leadIds.length,
      assignedCount: assignedLeads.length,
      failedCount: failedLeads.length,
      assignmentMethod: assignmentMethod,
      assignedLeads,
      failedLeads
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/roundrobin/update-method - Change assignment method
router.put('/update-method', admin, async (req, res) => {
  try {
    const { method } = req.body;

    const validMethods = ['round_robin', 'load_balanced', 'score_based'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ message: 'Invalid method. Use: round_robin, load_balanced, or score_based' });
    }

    let rrState = await RoundRobin.findOne();
    if (!rrState) {
      rrState = new RoundRobin({ assignmentMethod: method });
    } else {
      rrState.assignmentMethod = method;
    }

    await rrState.save();

    res.json({
      success: true,
      message: `Assignment method updated to ${method}`,
      assignmentMethod: rrState.assignmentMethod
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/roundrobin/reset - Reset round robin state
router.put('/reset', admin, async (req, res) => {
  try {
    const rrState = await RoundRobin.findOne();

    if (rrState) {
      rrState.currentIndex = 0;
      rrState.totalAssignments = 0;
      rrState.lastReset = new Date();
      rrState.lastUpdated = new Date();
      await rrState.save();
    } else {
      await new RoundRobin({
        currentIndex: 0,
        totalAssignments: 0,
        lastReset: new Date()
      }).save();
    }

    res.json({
      success: true,
      message: 'Round robin state reset',
      resetAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/roundrobin/assignment-history - Get assignment history
router.get('/assignment-history', auth, admin, async (req, res) => {
  try {
    const { employeeId, limit } = req.query;
    const pageLimit = parseInt(limit) || 20;

    let filter = {};
    if (employeeId) filter.assignedTo = employeeId;

    if (typeof AssignmentHistory === 'undefined') {
      return res.status(400).json({ message: 'AssignmentHistory model not available' });
    }

    const history = await AssignmentHistory.find(filter)
      .populate('leadId', 'customerName mobile email')
      .populate('assignedTo', 'name employeeId')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(pageLimit);

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/roundrobin/statistics - Get detailed statistics
router.get('/statistics', auth, admin, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee', status: 'Active' }).sort({ name: 1 });

    const statistics = await Promise.all(
      employees.map(async (emp) => {
        const totalLeads = await Lead.countDocuments({ assignedTo: emp._id });
        const activeLeads = await Lead.countDocuments({ assignedTo: emp._id, status: { $nin: ['Closed', 'Lost'] } });
        const closedLeads = await Lead.countDocuments({ assignedTo: emp._id, status: 'Closed' });
        const lostLeads = await Lead.countDocuments({ assignedTo: emp._id, status: 'Lost' });
        const closureRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(2) : 0;

        return {
          employeeId: emp._id,
          name: emp.name,
          email: emp.email,
          score: emp.score,
          stats: {
            totalLeads,
            activeLeads,
            closedLeads,
            lostLeads,
            closureRate: parseFloat(closureRate)
          }
        };
      })
    );

    res.json({
      success: true,
      timestamp: new Date(),
      employeeCount: employees.length,
      statistics,
      totalLeads: statistics.reduce((sum, emp) => sum + emp.stats.totalLeads, 0),
      totalClosed: statistics.reduce((sum, emp) => sum + emp.stats.closedLeads, 0)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/roundrobin/export-assignments - Export assignment data
router.get('/export-assignments', auth, admin, async (req, res) => {
  try {
    const { format } = req.query; // csv, json

    const assignments = await Lead.find({ assignedTo: { $ne: null } })
      .populate('assignedTo', 'name employeeId email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      let csv = 'Customer Name,Mobile,Email,Status,Assigned To,Assigned Date\n';
      assignments.forEach(lead => {
        csv += `"${lead.customerName}","${lead.mobile}","${lead.email}","${lead.status}","${lead.assignedTo?.name || 'N/A'}","${lead.createdAt.toISOString()}"\n`;
      });
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename="roundrobin_assignments.csv"');
      res.send(csv);
    } else {
      res.json({
        success: true,
        format: 'json',
        count: assignments.length,
        data: assignments
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/roundrobin/manual-assign - Manually assign lead to specific employee
router.post('/manual-assign', admin, async (req, res) => {
  try {
    const { leadId, employeeId } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    lead.assignedTo = employeeId;
    await lead.save();
    await lead.populate('assignedTo', 'name employeeId email');

    // Record as manual assignment
    if (typeof AssignmentHistory !== 'undefined') {
      await AssignmentHistory.create({
        leadId: lead._id,
        to: employeeId,
        assignedBy: req.user?._id || null,
        note: `Manually assigned`
      });
    }

    res.json({
      success: true,
      message: 'Lead manually assigned',
      lead
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
