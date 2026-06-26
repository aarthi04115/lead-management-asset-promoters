const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  source: {
    type: String,
    enum: ['Facebook Ads', 'Google Ads', 'Website Form', 'Walk-in', 'Referral', 'Instagram', 'Other'],
    default: 'Website Form'
  },
  intent: { type: String }, // property they're interested in
  status: {
    type: String,
    enum: ['New', 'Attempted Call', 'Connected', 'Interested', 'Site Visit Scheduled', 'Closed', 'Lost'],
    default: 'New'
  },
  priority: { type: String, enum: ['High', 'Mid', 'Low'], default: 'Mid' },
  score: { type: Number, default: 50, min: 0, max: 100 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
