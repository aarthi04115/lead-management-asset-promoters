const mongoose = require("mongoose");

const siteVisitSchema = new mongoose.Schema(
    {
        employeeName: { type: String, trim: true }, // Added for source compatibility
        customerName: { type: String, required: true, trim: true },
        leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
        property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
        propertyName: { type: String, trim: true }, // Added for source compatibility
        propertyLocation: { type: String, default: "" },
        agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        selfieImage: { type: String, default: "default.jpg" },
        distance: { type: Number, default: 0 },
        customerFeedback: { type: String, default: "" },
        remarks: { type: String, default: "" },
        visitTime: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Scheduled", "Verified", "Cancelled"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("SiteVisit", siteVisitSchema);
