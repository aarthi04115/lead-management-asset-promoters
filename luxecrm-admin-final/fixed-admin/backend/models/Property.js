const mongoose = require("mongoose");

const AmenitySchema = new mongoose.Schema({
  icon: { type: String, required: true },
  label: { type: String, required: true },
});

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, default: "—" },
  meta: { type: String, default: "" },
  iconColor: { type: String, enum: ["error", "primary"], default: "primary" },
  icon: { type: String, default: "description" },
  fileData: { type: String, default: null }, // base64 data URL for real downloads
});

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    price: { type: String, required: true },
    status: {
      type: String,
      enum: ["Available", "Negotiation", "Booked"],
      default: "Available",
    },
    images: [{ type: String }],
    imageAlt: { type: String, default: "" },
    description: { type: String, default: "" },
    lotSize: { type: String, default: "—" },
    amenities: [AmenitySchema],
    documents: [DocumentSchema],
    beds: { type: Number, default: null },
    baths: { type: String, default: null },
    sqft: { type: String, default: null },
    commission: { type: String, default: null },
    yearBuilt: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", PropertySchema);
