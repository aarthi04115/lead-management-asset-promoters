const Lead = require("../models/Lead");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private (Admin/Employee)
exports.createLead = asyncHandler(async (req, res) => {
    const { name, email, phone, property, source, notes } = req.body;

    const lead = await Lead.create({
        name,
        email,
        phone,
        property,
        source,
        notes,
    });

    res.status(201).json({
        success: true,
        data: lead,
        message: "Lead created successfully"
    });
});

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Admin/Employee)
exports.getLeads = asyncHandler(async (req, res) => {
    const leads = await Lead.find().sort("-createdAt").populate("assignedTo", "name email");

    res.status(200).json({
        success: true,
        count: leads.length,
        data: leads,
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
