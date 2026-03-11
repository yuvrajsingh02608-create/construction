const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  phone: { type: String, default: '' },
  dailyWage: { type: Number, default: 0 },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  address: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  photo: { type: String, default: '' },
  idProof: { type: String, default: '' },
  joinDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
