const mongoose = require('mongoose');

const roundRobinSchema = new mongoose.Schema({
  currentIndex: { type: Number, default: 0 },
  activeEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalAssignments: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  assignmentMethod: { type: String, enum: ['round_robin', 'load_balanced', 'score_based'], default: 'round_robin' },
  leadsPerEmployee: { type: Number, default: 10 },
  lastReset: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  rotationOrder: [{ employeeId: mongoose.Schema.Types.ObjectId, assignmentCount: { type: Number, default: 0 } }],
}, { timestamps: true });

module.exports = mongoose.model('RoundRobin', roundRobinSchema);
