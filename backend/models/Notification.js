const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for broadcast
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
