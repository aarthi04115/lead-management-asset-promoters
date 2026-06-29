const SiteVisit = require("../models/SiteVisit");
const calculateDistance = require("../services/locationService");
const Lead = require("../models/Lead");

// @desc    Create a site visit
// @route   POST /api/sitevisits
// @access  Private (Admin/Employee)
exports.createSiteVisit = async (req, res) => {
    try {
        const {
            employeeName,
            customerName,
            propertyName,
            latitude,
            longitude,
            remarks,
            propertyLatitude,
            propertyLongitude,
            propertyLocation,
            customerFeedback,
            leadId,
            property
        } = req.body;

        const targetLat = propertyLatitude || 11.6643;
        const targetLon = propertyLongitude || 78.1460;

        const distance = calculateDistance(
            Number(latitude),
            Number(longitude),
            targetLat,
            targetLon
        );

        const siteVisit = await SiteVisit.create({
            employeeName: req.restrictToOwnData ? req.user.name : (employeeName || req.user.name),
            customerName,
            property: property || null,
            propertyName,
            propertyLocation: propertyLocation || "",
            latitude: Number(latitude),
            longitude: Number(longitude),
            remarks,
            customerFeedback: customerFeedback || "",
            agent: req.user?._id,
            selfieImage: req.file ? req.file.filename : "default.jpg",
            visitTime: new Date(),
            distance,
            status: "Pending",
            leadId: leadId || null
        });

        // Auto update lead if leadId present
        if (leadId) {
            await Lead.findByIdAndUpdate(leadId, { status: "Site Visit Scheduled" });
        }

        res.status(201).json({
            success: true,
            message: "Site Visit Created Successfully",
            data: siteVisit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all site visits (with searching/filtering)
// @route   GET /api/sitevisits
// @access  Private (Admin/Employee)
exports.getAllVisits = async (req, res) => {
    try {
        let query = {};

        if (req.restrictToOwnData) {
            query = { agent: req.user._id };
        } else if (req.query.assignedTo) {
            query = { agent: req.query.assignedTo };
        }

        if (req.query.search) {
            const search = req.query.search;
            const searchOr = [
                { customerName: { $regex: search, $options: 'i' } },
                { propertyName: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } },
                { employeeName: { $regex: search, $options: 'i' } },
                { remarks: { $regex: search, $options: 'i' } },
            ];

            if (query.$or) {
                query.$and = [{ $or: query.$or }, { $or: searchOr }];
                delete query.$or;
            } else {
                query.$or = searchOr;
            }
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await SiteVisit.countDocuments(query);
        const visits = await SiteVisit.find(query)
            .populate("agent", "name email")
            .populate("property", "title location")
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: visits.length,
            total,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: visits
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single visit by ID
// @route   GET /api/sitevisits/:id
// @access  Private (Admin/Employee)
exports.getVisitById = async (req, res) => {
    try {
        const visit = await SiteVisit.findById(req.params.id)
            .populate("agent", "name email")
            .populate("property", "title location");

        if (!visit) {
            return res.status(404).json({ success: false, message: "Visit Not Found" });
        }

        if (req.restrictToOwnData && visit.agent.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to access this site visit" });
        }

        res.status(200).json({ success: true, data: visit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve site visit
// @route   PUT /api/sitevisits/:id/approve
// @access  Private/Admin
exports.approveVisit = async (req, res) => {
    try {
        const visit = await SiteVisit.findByIdAndUpdate(
            req.params.id,
            { status: "Approved" },
            { new: true }
        );

        if (!visit) {
            return res.status(404).json({ success: false, message: "Visit Not Found" });
        }

        // Auto update lead if leadId present
        if (visit.leadId) {
            await Lead.findByIdAndUpdate(visit.leadId, { status: "Site Visit Completed" });
        }

        res.status(200).json({ success: true, message: "Visit Approved", data: visit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reject site visit
// @route   PUT /api/sitevisits/:id/reject
// @access  Private/Admin
exports.rejectVisit = async (req, res) => {
    try {
        const visit = await SiteVisit.findByIdAndUpdate(
            req.params.id,
            { status: "Rejected" },
            { new: true }
        );

        if (!visit) {
            return res.status(404).json({ success: false, message: "Visit Not Found" });
        }

        res.status(200).json({ success: true, message: "Visit Rejected", data: visit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update site visit
// @route   PUT /api/sitevisits/:id
// @access  Private (Admin/Employee)
exports.updateVisit = async (req, res) => {
    try {
        const visitCheck = await SiteVisit.findById(req.params.id);
        if (!visitCheck) {
            return res.status(404).json({ success: false, message: "Visit Not Found" });
        }

        if (req.restrictToOwnData && visitCheck.agent.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this site visit" });
        }

        const { remarks, status, customerFeedback } = req.body;
        const updateFields = {};
        if (remarks !== undefined) updateFields.remarks = remarks;
        if (status !== undefined) updateFields.status = status;
        if (customerFeedback !== undefined) updateFields.customerFeedback = customerFeedback;

        const visit = await SiteVisit.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Visit Updated Successfully",
            data: visit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete site visit
// @route   DELETE /api/sitevisits/:id
// @access  Private/Admin
exports.deleteVisit = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Only admins can delete site visits" });
        }

        const visit = await SiteVisit.findByIdAndDelete(req.params.id);
        if (!visit) {
            return res.status(404).json({ success: false, message: "Visit Not Found" });
        }
        res.status(200).json({ success: true, message: "Visit Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
