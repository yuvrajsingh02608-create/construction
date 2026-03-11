const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  date: { type: String, required: true }, // stored as 'YYYY-MM-DD'
  status: { type: String, enum: ['present', 'absent', 'halfday', 'leave'], default: 'absent' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
}, { timestamps: true });

// Compound unique index: one record per worker per date
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
