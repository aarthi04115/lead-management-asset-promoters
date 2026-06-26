const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
    {
        customerName: { type: String, required: true, trim: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        schedule: { type: Date, required: true },
        notes: { type: String, trim: true },
        status: { type: String, enum: ["Planned", "Completed", "Missed"], default: "Planned" },
        type: { type: String, enum: ["Call", "Email", "Meeting"], default: "Call" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("FollowUp", followUpSchema);
