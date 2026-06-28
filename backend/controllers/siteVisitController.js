const SiteVisit = require("../models/SiteVisit");
const calculateDistance = require("../services/locationService");

// @desc    Create a site visit
// @route   POST /api/sitevisits
// @access  Private
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
            propertyLongitude
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
            employeeName,
            customerName,
            propertyName,
            latitude: Number(latitude),
            longitude: Number(longitude),
            remarks,
            agent: req.user?._id,
            selfieImage: req.file ? req.file.filename : "default.jpg",
            visitTime: new Date(),
            distance,
            status: "Pending"
        });

        res.status(201).json({
            success: true,
            message: "Site Visit Created Successfully",
            data: siteVisit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all site visits
// @route   GET /api/sitevisits
// @access  Private/Admin
exports.getAllVisits = async (req, res) => {
    try {
        const visits = await SiteVisit.find()
            .populate("agent", "name")
            .populate("property", "propertyName")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: visits.length, data: visits });
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

// @desc    Delete site visit
// @route   DELETE /api/sitevisits/:id
// @access  Private/Admin
exports.deleteVisit = async (req, res) => {
    try {
        await SiteVisit.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Visit Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
