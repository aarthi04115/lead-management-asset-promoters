const Lead = require("../models/Lead");
const asyncHandler = require("../middleware/asyncHandler");
const RoundRobinService = require("../utils/roundRobinService");

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private (Admin/Employee)
exports.createLead = asyncHandler(async (req, res) => {
    // Create lead with all passed properties
    const lead = await Lead.create(req.body);

    // If no employee was manually assigned, try auto-assignment
    if (!lead.assignedTo) {
        try {
            const result = await RoundRobinService.assignLeadAuto(lead._id);
            lead.assignedTo = result.employeeId;
            await lead.save();
        } catch (error) {
            console.warn('Auto-assignment failed:', error.message);
        }
    }

    const populatedLead = await Lead.findById(lead._id).populate("assignedTo", "name email");

    res.status(201).json({
        success: true,
        data: populatedLead,
        message: "Lead created successfully"
    });
});

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Admin/Employee)
exports.getLeads = asyncHandler(async (req, res) => {
    const { search, status, source, property, assignedTo, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== "All Statuses") query.status = status;
    if (source && source !== "All Sources") query.source = source;
    if (property) query.property = property;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [
            { name: regex },
            { email: regex },
            { phone: regex },
            { property: regex },
            { source: regex },
            { leadId: regex }
        ];
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
        data: leads,
        meta: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        },
        message: "Leads retrieved successfully"
    });
});

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private (Admin/Employee)
exports.updateLeadStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    );

    if (!lead) {
        res.status(404);
        throw new Error("Lead not found");
    }

    res.status(200).json({
        success: true,
        data: lead,
        message: "Lead status updated successfully"
    });
});

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private (Admin/Employee)
exports.updateLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lead) {
        res.status(404);
        throw new Error("Lead not found");
    }
    res.status(200).json({
        success: true,
        data: lead,
        message: "Lead updated successfully"
    });
});

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin/Employee)
exports.deleteLead = asyncHandler(async (req, res) => {
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
