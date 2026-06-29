const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
    {
        customerName: { type: String, required: true, trim: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
        schedule: { type: Date, required: true },
        scheduledAt: { type: Date },
        followUpDate: { type: String },
        followUpTime: { type: String },
        notes: { type: String, trim: true, default: "" },
        status: { type: String, enum: ["Planned", "Completed", "Missed", "Pending", "Upcoming", "Overdue"], default: "Pending" },
        type: { type: String, enum: ["Call", "Email", "Meeting"], default: "Call" },
        phone: { type: String, trim: true },
        whatsapp: { type: String, trim: true },
        property: { type: String, trim: true },
        priority: { type: String, enum: ["High", "Medium", "Low", "Normal", "Urgent"], default: "Medium" },
        outcome: { type: String, enum: ["Interested", "Callback", "No Response", "Not Interested"], default: "Callback" },
        reminderTriggered: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("FollowUp", followUpSchema);
