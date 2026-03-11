const mongoose = require('mongoose');

const supervisorAttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  status: { type: String, enum: ['present', 'absent'], default: 'absent' },
  lastPing: { type: Date, default: Date.now },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  history: [{
    timestamp: { type: Date, default: Date.now },
    lat: { type: Number },
    lng: { type: Number },
    status: { type: String }
  }]
}, { timestamps: true });

supervisorAttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('SupervisorAttendance', supervisorAttendanceSchema);
