const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const SupervisorAttendance = require('../models/SupervisorAttendance');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getDistance } = require('../utils/geofenceUtils');

// @desc    Ping location for supervisor attendance
// @route   POST /api/attendance/ping-location
// @access  Private (Supervisor/Manager)
router.post('/ping-location', protect, async (req, res) => {
  try {
    const { lat, lng, projectId } = req.body;
    const userId = req.user._id;
    const companyId = req.user.companyId;

    if (!lat || !lng || !projectId) {
      return res.status(400).json({ message: 'Missing coordinates or project ID' });
    }

    const project = await Project.findOne({ _id: projectId, companyId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.geofence.lat || !project.geofence.lng) {
      return res.status(400).json({ message: 'Project has no geofence set' });
    }

    const distance = getDistance(lat, lng, project.geofence.lat, project.geofence.lng);
    const isInside = distance <= project.geofence.radius;
    const currentStatus = isInside ? 'present' : 'absent';
    const today = new Date().toISOString().split('T')[0];

    // Find or create today's attendance record
    let attendance = await SupervisorAttendance.findOne({ userId, projectId, date: today, companyId });

    if (!attendance) {
      attendance = new SupervisorAttendance({
        userId,
        projectId,
        date: today,
        status: currentStatus,
        companyId,
        history: []
      });
    }

    const previousStatus = attendance.status;
    attendance.status = currentStatus;
    attendance.lastPing = new Date();
    attendance.history.push({
      timestamp: new Date(),
      lat,
      lng,
      status: currentStatus
    });

    // Alert if status changed from present to absent
    if (previousStatus === 'present' && currentStatus === 'absent') {
      const managers = await User.find({ 
        role: 'manager', 
        companyId 
      });

      const notificationPromises = managers.map(manager => 
        Notification.create({
          userId: manager._id,
          companyId,
          type: 'attendance',
          title: 'Supervisor Left Site',
          message: `${req.user.name} has left the site area for project ${project.name}.`,
          link: `/projects/${projectId}`
        })
      );
      
      // Also notify owner
      const owners = await User.find({ role: 'owner', companyId });
      owners.forEach(owner => {
        notificationPromises.push(Notification.create({
          userId: owner._id,
          companyId,
          type: 'warning',
          title: 'Site Alert: Supervisor Absent',
          message: `${req.user.name} is no longer at ${project.name}.`,
          link: `/projects/${projectId}`
        }));
      });

      await Promise.all(notificationPromises);
    }

    await attendance.save();

    res.json({
      success: true,
      status: currentStatus,
      distance: Math.round(distance),
      inside: isInside
    });

  } catch (error) {
    console.error('Ping Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get supervisor attendance for a project
// @route   GET /api/attendance/supervisor/:projectId
router.get('/supervisor/:projectId', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const query = { 
      projectId: req.params.projectId, 
      companyId: req.user.companyId 
    };
    if (date) query.date = date;

    const attendance = await SupervisorAttendance.find(query).populate('userId', 'name email avatar');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
