const mongoose = require('mongoose');

const siteVisitSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed', 'Missed', 'Cancelled'], default: 'Scheduled' },
  notes: { type: String },
  gpsVerified: { type: Boolean, default: false },
  selfieUploaded: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SiteVisit', siteVisitSchema);
