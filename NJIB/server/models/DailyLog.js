const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  date: { type: String, required: true },
  weather: { type: String, default: 'Sunny' },
  notes: { type: String, default: '' },
  labor: [{
    name: String, role: String,
    count: { type: Number, default: 1 },
    hours: { type: Number, default: 8 },
  }],
  equipment: [{ name: String, hours: Number, operator: String }],
  materials: [{ name: String, quantity: String, unit: String }],
  photos: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
