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
