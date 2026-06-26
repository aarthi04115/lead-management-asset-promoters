const SiteVisit = require("../models/SiteVisit");

exports.createSiteVisit = async (req, res) => {
    try {
        const siteVisit = await SiteVisit.create(req.body);
        res.status(201).json({ success: true, data: siteVisit });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getSiteVisits = async (req, res) => {
    try {
        const siteVisits = await SiteVisit.find().sort("-time").populate("agent", "name").populate("property", "title");
        res.status(200).json({ success: true, data: siteVisits });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
