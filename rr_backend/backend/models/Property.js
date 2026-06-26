const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Residential', 'Commercial', 'Land/Development'], default: 'Residential' },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  city: { type: String },
  country: { type: String },
  beds: { type: Number },
  baths: { type: Number },
  sqft: { type: Number },
  acres: { type: Number },
  status: { type: String, enum: ['Active', 'Under Review', 'Contracted', 'Sold', 'Off-Market'], default: 'Active' },
  badge: { type: String, enum: ['Exclusive', 'New Listing', 'Off-Market', ''] },
  description: { type: String },
  images: [{ type: String }],
  listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
