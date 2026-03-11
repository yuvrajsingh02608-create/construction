const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, default: '' },
  client: { type: String, default: '' },
  description: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  status: { type: String, enum: ['planning', 'active', 'onhold', 'completed'], default: 'active' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  assignedManagers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedEngineers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
  photos: [{ type: String }],
  geofence: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    radius: { type: Number, default: 300 } // Default 300 meters
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
