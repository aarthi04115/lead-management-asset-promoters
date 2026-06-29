const FollowUp = require("../models/FollowUp");
const db = require('../services/followUpDB');
const asyncHandler = require("../middleware/asyncHandler");

const mapFollowUpForFrontend = (fu) => {
    if (!fu) return fu;
    const f = fu.toObject ? fu.toObject() : fu;
    if (f.schedule) {
        const dateObj = new Date(f.schedule);
        f.followUpDate = f.followUpDate || dateObj.toISOString().slice(0, 10);
        f.followUpTime = f.followUpTime || dateObj.toTimeString().slice(0, 5);
    } else if (f.scheduledAt) {
        const dateObj = new Date(f.scheduledAt);
        f.followUpDate = f.followUpDate || dateObj.toISOString().slice(0, 10);
        f.followUpTime = f.followUpTime || dateObj.toTimeString().slice(0, 5);
    } else if (!f.followUpDate && f.createdAt) {
        const dateObj = new Date(f.createdAt);
        f.followUpDate = f.followUpDate || dateObj.toISOString().slice(0, 10);
        f.followUpTime = f.followUpTime || dateObj.toTimeString().slice(0, 5);
    }
    if (f.phone) f.phoneNumber = f.phone;
    if (f.whatsapp) f.whatsappNumber = f.whatsapp;
    return f;
};

const getQuery = (req) => {
    if (!req.restrictToOwnData) return {};
    return { assignedTo: req.user._id };
};

// @desc    Get all follow-ups
// @route   GET /api/followups
// @access  Private (Admin/Employee)
exports.getFollowUps = asyncHandler(async (req, res) => {
    const q = getQuery(req);
    const followups = await db.getAllFollowUps(q);
    res.status(200).json({
        success: true,
        count: followups.length,
        data: followups.map(mapFollowUpForFrontend)
    });
});

// @desc    Get next upcoming follow-up
// @route   GET /api/followups/next
// @access  Private (Admin/Employee)
exports.getNextFollowUp = asyncHandler(async (req, res) => {
    const q = getQuery(req);
    const nextFollowUp = await db.getNextFollowUp(q);
    res.status(200).json({
        success: true,
        data: nextFollowUp ? mapFollowUpForFrontend(nextFollowUp) : null
    });
});

// @desc    Get latest follow-up by customer name
// @route   GET /api/followups/latest
// @access  Private (Admin/Employee)
exports.getLatestByCustomer = asyncHandler(async (req, res) => {
    const { customerName } = req.query;
    if (!customerName) {
        res.status(400);
        throw new Error("Customer name query param is required");
    }
    const q = getQuery(req);
    const latest = await db.getLatestByCustomer(customerName, q);
    res.status(200).json({
        success: true,
        data: latest ? mapFollowUpForFrontend(latest) : null
    });
});

// @desc    Get upcoming reminders within 10 mins window
// @route   GET /api/followups/reminders
// @access  Private (Admin/Employee)
exports.getReminders = asyncHandler(async (req, res) => {
    const q = getQuery(req);
    const reminders = await db.getReminders(q);
    res.status(200).json({
        success: true,
        count: reminders.length,
        data: reminders.map(mapFollowUpForFrontend)
    });
});

// @desc    Get upcoming alerts
// @route   GET /api/followups/upcoming
// @access  Private (Admin/Employee)
exports.getUpcomingReminders = asyncHandler(async (req, res) => {
    const q = getQuery(req);
    const reminders = await db.getUpcomingReminders(q);
    res.status(200).json({
        success: true,
        count: reminders.length,
        data: reminders.map(mapFollowUpForFrontend)
    });
});

// @desc    Create a new follow-up
// @route   POST /api/followups
// @access  Private (Admin/Employee)
exports.createFollowUp = asyncHandler(async (req, res) => {
    const { customerName, phone, followUpDate, followUpTime } = req.body;

    if (!customerName || (!phone && !req.body.phoneNumber) || !followUpDate || !followUpTime) {
        res.status(400);
        throw new Error("Missing required fields: customerName, phone/phoneNumber, followUpDate, followUpTime");
    }

    const targetPhone = phone || req.body.phoneNumber;
    const dateStr = followUpDate;
    const timeStr = followUpTime || '00:00';
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const scheduleDate = new Date(year, month - 1, day, hours, minutes, 0);

    const payload = {
        customerName,
        phone: targetPhone,
        whatsapp: req.body.whatsapp || req.body.whatsappNumber || targetPhone,
        property: req.body.property || req.body.propertyName || "",
        schedule: scheduleDate,
        scheduledAt: scheduleDate,
        followUpDate,
        followUpTime,
        priority: req.body.priority || 'Medium',
        status: req.body.status || 'Pending',
        outcome: req.body.outcome || 'Callback',
        notes: req.body.notes || '',
        reminderTriggered: false,
        assignedTo: req.restrictToOwnData ? req.user._id : (req.body.assignedTo || req.user._id)
    };

    if (req.body.leadId) {
        payload.leadId = req.body.leadId;
    }

    const followUp = await db.createFollowUp(payload);

    // Auto-update standard lead status to Follow-Up if leadId present
    if (payload.leadId) {
        const Lead = require("../models/Lead");
        await Lead.findByIdAndUpdate(payload.leadId, { status: "Follow-Up" });
    }

    res.status(201).json({
        success: true,
        message: "Follow-up created successfully",
        data: mapFollowUpForFrontend(followUp)
    });
});

// @desc    Update a follow-up
// @route   PUT /api/followups/:id
// @access  Private (Admin/Employee)
exports.updateFollowUp = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await db.getFollowUpById(id);

    if (!existing) {
        res.status(404);
        throw new Error("Follow-up not found");
    }

    if (req.restrictToOwnData && existing.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to update this follow-up");
    }

    const allowed = [
        'customerName', 'phone', 'phoneNumber', 'whatsapp', 'whatsappNumber', 'propertyName', 'property',
        'followUpDate', 'followUpTime', 'priority', 'status', 'outcome', 'notes', 'reminderTriggered'
    ];

    const updates = {};
    allowed.forEach((key) => {
        if (req.body[key] !== undefined) {
            if (key === 'phone' || key === 'phoneNumber') {
                updates.phone = req.body[key];
            } else if (key === 'whatsapp' || key === 'whatsappNumber') {
                updates.whatsapp = req.body[key];
            } else if (key === 'propertyName' || key === 'property') {
                updates.property = req.body[key];
            } else {
                updates[key] = req.body[key];
            }
        }
    });

    if (updates.followUpDate || updates.followUpTime) {
        const dateStr = updates.followUpDate || existing.followUpDate;
        const timeStr = updates.followUpTime || existing.followUpTime || '00:00';
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduleDate = new Date(year, month - 1, day, hours, minutes, 0);
        updates.schedule = scheduleDate;
        updates.scheduledAt = scheduleDate;
    }

    const updated = await db.updateFollowUp(id, updates);
    res.status(200).json({
        success: true,
        message: "Follow-up updated successfully",
        data: mapFollowUpForFrontend(updated)
    });
});

// @desc    Mark a follow-up as completed
// @route   PUT /api/followups/:id/complete
// @access  Private (Admin/Employee)
exports.markAsCompleted = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await db.getFollowUpById(id);

    if (!existing) {
        res.status(404);
        throw new Error("Follow-up not found");
    }

    if (req.restrictToOwnData && existing.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to update this follow-up");
    }

    const updated = await db.updateFollowUp(id, { status: 'Completed', outcome: req.body.outcome || existing.outcome });

    // Also update parent lead if outcome is relevant
    if (existing.leadId && req.body.outcome) {
        const Lead = require("../models/Lead");
        await Lead.findByIdAndUpdate(existing.leadId, { status: req.body.outcome === 'Interested' ? 'Interested' : 'Contacted' });
    }

    res.status(200).json({
        success: true,
        message: "Follow-up marked as completed",
        data: mapFollowUpForFrontend(updated)
    });
});

// @desc    Delete a follow-up
// @route   DELETE /api/followups/:id
// @access  Private (Admin only)
exports.deleteFollowUp = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Only admin can delete follow-ups
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error("Only admins can delete follow-ups");
    }

    const deleted = await db.deleteFollowUp(id);
    if (!deleted) {
        res.status(404);
        throw new Error("Follow-up not found");
    }

    res.status(200).json({
        success: true,
        message: "Follow-up deleted successfully"
    });
});

// @desc    Get dashboard aggregation statistics
// @route   GET /api/followups/stats
// @access  Private (Admin/Employee)
exports.getStats = asyncHandler(async (req, res) => {
    const q = getQuery(req);
    const stats = await db.getStats(q);
    res.status(200).json({
        success: true,
        data: stats
    });
});

// @desc    Filtered and paginated search list
// @route   GET /api/followups/filter
// @access  Private (Admin/Employee)
exports.filterFollowUps = asyncHandler(async (req, res) => {
    const { status, priority, timeFilter, page, limit, search } = req.query;
    const filters = {
        status: status || 'All',
        priority: priority || 'All',
        timeFilter: timeFilter || 'All',
        page: page,
        limit: limit,
        search: search
    };
    const q = getQuery(req);
    const result = await db.filterFollowUps(filters, q);
    res.status(200).json({
        success: true,
        count: result.data.length,
        data: result.data.map(mapFollowUpForFrontend),
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalRecords: result.totalRecords,
        recordsPerPage: result.recordsPerPage
    });
});
