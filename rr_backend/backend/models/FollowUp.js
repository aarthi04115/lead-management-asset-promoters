const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Call', 'Email', 'Site Visit', 'Meeting', 'WhatsApp'], default: 'Call' },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Overdue', 'Cancelled'], default: 'Pending' },
  notes: { type: String },
  outcome: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', followUpSchema);
