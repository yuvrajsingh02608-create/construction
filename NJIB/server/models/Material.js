const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, default: '' },
  ordered: { type: Number, default: 0 },
  received: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  alertLevel: { type: Number, default: 0 },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
