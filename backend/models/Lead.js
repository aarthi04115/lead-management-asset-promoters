const mongoose = require("mongoose");

const uuidv4 = () => new mongoose.Types.ObjectId().toString();

const activitySchema = new mongoose.Schema({
    id: { type: String, default: uuidv4 },
    type: { type: String, default: 'status_change' },
    action: String,
    details: String,
    from: String,
    to: String,
    performedBy: {
        id: String,
        name: String,
    },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const noteSchema = new mongoose.Schema({
    id: { type: String, default: uuidv4 },
    text: String,
    addedBy: {
        id: String,
        name: String,
    },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            index: true,
        },
        property: {
            type: String,
            required: [true, "Property interest is required"],
            trim: true,
        },
        source: {
            type: String,
            default: "Other",
            trim: true,
        },
        status: {
            type: String,
            enum: ["New", "Attempted Call", "Connected", "Contacted", "Interested", "Follow-Up", "Site Visit Scheduled", "Site Visit Completed", "Negotiation", "Converted", "Closed", "Booked", "Sold", "Lost", "Site Visit"],
            default: "New",
        },
        campaign: {
            type: String,
            trim: true,
            default: "",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        notes: [noteSchema],
        activities: [activitySchema],
        leadId: {
            type: String,
            unique: true,
        }
    },
    { timestamps: true }
);

// Auto-generate leadId if not provided
leadSchema.pre("save", function (next) {
    if (!this.leadId) {
        this.leadId = `LID-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    next();
});

module.exports = mongoose.model("Lead", leadSchema);
