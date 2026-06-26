const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true, index: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        price: { type: String, required: true },
        type: { type: String, enum: ["Residential", "Commercial", "Resort", "Historic"], default: "Residential" },
        status: { type: String, enum: ["Available", "Negotiation", "Booked", "Sold"], default: "Available" },
        bedrooms: { type: Number, default: 0 },
        bathrooms: { type: Number, default: 0 },
        area: { type: Number, default: 0 },
        amenities: { type: [String], default: [] },
        images: { type: [String], default: [] },
        brochure: { type: String, default: "" },
        image: { type: String, default: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" },
        views: { type: String, default: "0" },
        description: { type: String, trim: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
