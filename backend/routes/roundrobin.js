const express = require('express');
const router = express.Router();
const RoundRobin = require('../models/RoundRobin');
const User = require('../models/User');
const Lead = require('../models/Lead');
const AssignmentHistory = require('../models/AssignmentHistory');
const Notification = require('../models/Notification');
const RoundRobinService = require('../utils/roundRobinService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * ROUND ROBIN ADMINISTRATION ROUTES
 * Role: Admin
 */

// GET /api/roundrobin/status - Get current round robin status
router.get('/status', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const stats = await RoundRobinService.getStatistics();
        res.json({
            success: true,
            ...stats
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/roundrobin/assign - Assign a lead using round robin
router.post('/assign', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { leadId, method } = req.body;

        if (!leadId) {
            return res.status(400).json({ success: false, message: 'leadId is required' });
        }

        const result = await RoundRobinService.assignLeadAuto(leadId);

        // Record assignment history
        await AssignmentHistory.create({
            leadId: result.lead._id,
            assignedTo: result.employeeId,
            assignedBy: req.user._id,
            assignmentMethod: result.method,
            note: `Auto-assigned via ${result.method}`
        });

        // Create notification for employee
        await Notification.create({
            recipientId: result.employeeId,
            type: 'lead_assigned',
            message: `New lead assigned: ${result.lead.name}`,
            relatedId: result.lead._id,
            read: false
        });

        res.json({
            success: true,
            message: `Lead assigned via ${result.method}`,
            ...result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/roundrobin/update-method - Change assignment method
router.put('/update-method', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { method } = req.body;
        const rrState = await RoundRobinService.setAssignmentMethod(method);

        res.json({
            success: true,
            message: `Assignment method updated to ${method}`,
            assignmentMethod: rrState.assignmentMethod
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/roundrobin/reset - Reset round robin state
router.put('/reset', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const rrState = await RoundRobinService.reset();
        res.json({
            success: true,
            message: 'Round robin state reset',
            resetAt: rrState.lastReset
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/roundrobin/assignment-history - Get assignment history
router.get('/assignment-history', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { employeeId, limit } = req.query;
        const pageLimit = parseInt(limit) || 20;

        let filter = {};
        if (employeeId) filter.to = employeeId;

        const history = await AssignmentHistory.find(filter)
            .populate('leadId', 'name email phone status')
            .populate('to', 'name employeeId role')
            .populate('assignedBy', 'name role')
            .sort({ assignedAt: -1 })
            .limit(pageLimit);

        res.json({
            success: true,
            count: history.length,
            history
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/roundrobin/manual-assign - Manually assign lead
router.post('/manual-assign', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { leadId, employeeId } = req.body;

        if (!leadId || !employeeId) {
            return res.status(400).json({ success: false, message: 'leadId and employeeId are required' });
        }

        const lead = await Lead.findByIdAndUpdate(
            leadId,
            { assignedTo: employeeId },
            { new: true }
        ).populate('assignedTo', 'name employeeId');

        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

        // Record as manual assignment
        await AssignmentHistory.create({
            leadId: lead._id,
            to: employeeId,
            assignedBy: req.user._id,
            assignmentMethod: 'manual',
            note: 'Manually assigned by admin'
        });

        // Notify employee
        await Notification.create({
            recipientId: employeeId,
            type: 'lead_assigned',
            message: `Lead manually assigned: ${lead.name}`,
            relatedId: lead._id,
            read: false
        });

        res.json({
            success: true,
            message: 'Lead manually assigned',
            lead
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
