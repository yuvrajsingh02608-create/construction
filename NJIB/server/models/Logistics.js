const mongoose = require('mongoose');

const logisticsSchema = new mongoose.Schema({
  machineName: { type: String, required: true },
  fromProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  toProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  departureDate: { type: String, required: true },
  eta: { type: String },
  status: { type: String, enum: ['in-transit', 'arrived'], default: 'in-transit' },
  notes: { type: String, default: '' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Logistics', logisticsSchema);
