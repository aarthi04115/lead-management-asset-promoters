const Lead = require("../models/Lead");
const asyncHandler = require("../middleware/asyncHandler");
const RoundRobinService = require("../utils/roundRobinService");

// Helper to support front-facing properties if page requests customerName/mobile
const mapLeadForFrontend = (lead) => {
    if (!lead) return null;
    const l = lead.toObject ? lead.toObject() : lead;
    l.customerName = l.name || l.customerName;
    l.mobile = l.phone || l.mobile;
    l.propertyInterested = l.propertyInterested || (l.property ? { name: l.property } : null);
    return l;
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private (Admin/Employee)
exports.createLead = asyncHandler(async (req, res) => {
    // Inject creator activity logs
    req.body.activities = [{
        type: 'created',
        action: 'Lead Created',
        details: 'Lead was created',
        performedBy: {
            id: req.user._id.toString(),
            name: req.user.name
        },
        createdAt: new Date()
    }];

    // Support notes string conversion
    if (req.body.notes && typeof req.body.notes === "string") {
        req.body.notes = [{
            text: req.body.notes,
            addedBy: {
                id: req.user._id.toString(),
                name: req.user.name
            },
            createdAt: new Date()
        }];
    }

    // Set assignedTo if restricted
    if (req.restrictToOwnData) {
        req.body.assignedTo = req.user._id;
    }

    // Create lead with all passed properties
    const lead = await Lead.create(req.body);

    // If no employee was manually assigned, try auto-assignment
    if (!lead.assignedTo) {
        try {
            const result = await RoundRobinService.assignLeadAuto(lead._id);
            lead.assignedTo = result.employeeId;
            lead.activities.push({
                type: 'assignment',
                action: 'Lead Assigned',
                details: `Lead automatically assigned to employee during Round Robin`,
                performedBy: {
                    id: 'system',
                    name: 'System Round-Robin'
                },
                createdAt: new Date()
            });
            await lead.save();
        } catch (error) {
            console.warn('Auto-assignment failed:', error.message);
        }
    }

    const populatedLead = await Lead.findById(lead._id).populate("assignedTo", "name email");

    res.status(201).json({
        success: true,
        data: mapLeadForFrontend(populatedLead),
        message: "Lead created successfully"
    });
});

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Admin/Employee)
exports.getLeads = asyncHandler(async (req, res) => {
    const { search, status, source, property, assignedTo, page = 1, limit = 10 } = req.query;
    const query = {};

    // Role dynamic isolation
    if (req.restrictToOwnData) {
        const FollowUp = require("../models/FollowUp");
        const SiteVisit = require("../models/SiteVisit");

        const userFollowUps = await FollowUp.find({ assignedTo: req.user._id });
        const fuLeadIds = userFollowUps.map(f => f.leadId).filter(Boolean);

        const userSiteVisits = await SiteVisit.find({ agent: req.user._id });
        const svLeadIds = userSiteVisits.map(s => s.leadId).filter(Boolean);

        const combinedLeadIds = [...fuLeadIds, ...svLeadIds];

        query.$or = [
            { assignedTo: req.user._id },
            { _id: { $in: combinedLeadIds } }
        ];
    } else if (assignedTo) {
        query.assignedTo = assignedTo;
    }

    if (status && status !== "All Statuses" && status !== "All") query.status = status;
    if (source && source !== "All Sources" && source !== "All") query.source = source;
    if (property) query.property = property;

    if (search) {
        const regex = new RegExp(search, 'i');
        const searchConditions = [
            { name: regex },
            { email: regex },
            { phone: regex },
            { property: regex },
            { source: regex },
            { leadId: regex }
        ];

        if (query.$or) {
            // Must satisfy both ownership and search conditions
            query.$and = [
                { $or: query.$or },
                { $or: searchConditions }
            ];
            delete query.$or;
        } else {
            query.$or = searchConditions;
        }
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
        .sort("-createdAt")
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate("assignedTo", "name email");

    res.status(200).json({
        success: true,
        count: leads.length,
        data: leads.map(mapLeadForFrontend),
        meta: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        },
        message: "Leads retrieved successfully"
    });
});

// @desc    Get lead by ID
// @route   GET /api/leads/:id
// @access  Private (Admin/Employee)
exports.getLeadById = asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email");
    if (!lead) {
        res.status(404);
        throw new Error("Lead not found");
    }

    if (req.restrictToOwnData && lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to view this lead");
    }

    const FollowUp = require("../models/FollowUp");
    const SiteVisit = require("../models/SiteVisit");

    const followUps = await FollowUp.find({ leadId: lead._id }).sort("-createdAt");
    const siteVisits = await SiteVisit.find({ leadId: lead._id }).sort("-createdAt");

    res.status(200).json({
        success: true,
        data: {
            ...mapLeadForFrontend(lead),
            followUps,
            siteVisits
        },
        message: "Lead retrieved successfully"
    });
});

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private (Admin/Employee)
exports.updateLeadStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
        res.status(404);
        throw new Error("Lead not found");
    }

    if (req.restrictToOwnData && lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to update this lead");
    }

    const oldStatus = lead.status;
    lead.status = status;

    lead.activities.push({
        type: 'status_change',
        action: `Status changed from ${oldStatus} to ${status}`,
        from: oldStatus,
        to: status,
        performedBy: {
            id: req.user._id.toString(),
            name: req.user.name
        },
        createdAt: new Date()
    });

    await lead.save();

    res.status(200).json({
        success: true,
        data: mapLeadForFrontend(lead),
        message: "Lead status updated successfully"
    });
});

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private (Admin/Employee)
exports.updateLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
        res.status(404);
        throw new Error("Lead not found");
    }

    if (req.restrictToOwnData && lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to update this lead");
    }

    if (req.restrictToOwnData && req.body.assignedTo && req.body.assignedTo.toString() !== lead.assignedTo.toString()) {
        res.status(403);
        throw new Error("Employees cannot assign leads to others");
    }

    // Capture potential status change log
    const oldStatus = lead.status;
    const newStatus = req.body.status;

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (newStatus && oldStatus !== newStatus) {
        updatedLead.activities.push({
            type: 'status_change',
            action: `Status changed from ${oldStatus} to ${newStatus}`,
            from: oldStatus,
            to: newStatus,
            performedBy: {
                id: req.user._id.toString(),
                name: req.user.name
            },
            createdAt: new Date()
        });
        await updatedLead.save();
    }

    res.status(200).json({
        success: true,
        data: mapLeadForFrontend(updatedLead),
        message: "Lead updated successfully"
    });
});

// @desc    Add note to a lead
// @route   POST /api/leads/:id/notes
// @access  Private (Admin/Employee)
exports.addLeadNote = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
        res.status(400);
        throw new Error("Note text is required");
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
        res.status(404);
        throw new Error("Lead not found");
    }

    if (req.restrictToOwnData && lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to add notes to this lead");
    }

    lead.notes.push({
        text: text.trim(),
        addedBy: {
            id: req.user._id.toString(),
            name: req.user.name
        },
        createdAt: new Date()
    });

    lead.activities.push({
        type: 'note_added',
        action: 'Note Added',
        details: text.trim().substring(0, 100),
        performedBy: {
            id: req.user._id.toString(),
            name: req.user.name
        },
        createdAt: new Date()
    });

    await lead.save();

    res.status(200).json({
        success: true,
        data: mapLeadForFrontend(lead),
        message: "Note added successfully"
    });
});

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin only)
exports.deleteLead = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error("Only admins can delete leads");
    }

    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
        res.status(404);
        throw new Error("Lead not found");
    }
    res.status(200).json({
        success: true,
        message: "Lead deleted successfully"
    });
});
