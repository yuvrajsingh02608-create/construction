const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  type: { type: String, enum: ['task', 'warning', 'attendance', 'info', 'success'], default: 'info' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
