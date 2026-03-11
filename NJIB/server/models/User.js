const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: false, unique: true, sparse: true, lowercase: true },
  role: { type: String, enum: ['owner', 'manager', 'engineer'], default: 'engineer' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
