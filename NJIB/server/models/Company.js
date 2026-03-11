const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  maxProjects: { type: Number, default: 5 },
  maxUsers: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
