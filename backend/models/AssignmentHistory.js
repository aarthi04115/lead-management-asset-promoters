const mongoose = require('mongoose');

const assignmentHistorySchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date, default: Date.now },
  note: { type: String }
});

module.exports = mongoose.model('AssignmentHistory', assignmentHistorySchema);
