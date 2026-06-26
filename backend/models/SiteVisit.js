const mongoose = require("mongoose");

const siteVisitSchema = new mongoose.Schema(
    {
        customerName: { type: String, required: true, trim: true },
        property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
        agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        time: { type: Date, required: true },
        status: { type: String, enum: ["Scheduled", "Pending", "Verified", "Cancelled"], default: "Scheduled" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("SiteVisit", siteVisitSchema);
