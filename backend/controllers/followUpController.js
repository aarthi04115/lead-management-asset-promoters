const FollowUp = require("../models/FollowUp");

exports.createFollowUp = async (req, res) => {
    try {
        const followup = await FollowUp.create(req.body);
        res.status(201).json({ success: true, data: followup });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getFollowUps = async (req, res) => {
    try {
        const followups = await FollowUp.find().sort("-schedule").populate("assignedTo", "name");
        res.status(200).json({ success: true, data: followups });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateFollowUp = async (req, res) => {
    try {
        const followup = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!followup) {
            return res.status(404).json({ success: false, message: "Follow-up not found" });
        }
        res.status(200).json({ success: true, data: followup });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteFollowUp = async (req, res) => {
    try {
        const followup = await FollowUp.findByIdAndDelete(req.params.id);
        if (!followup) {
            return res.status(404).json({ success: false, message: "Follow-up not found" });
        }
        res.status(200).json({ success: true, message: "Follow-up deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
