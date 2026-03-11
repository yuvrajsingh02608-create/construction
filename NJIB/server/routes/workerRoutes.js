const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Project = require('../models/Project');

// Helper to verify if user has access to project
const hasProjectAccess = async (user, projectId) => {
  if (user.role === 'owner') return true;
  const filter = { _id: projectId, companyId: user.companyId };
  if (user.role === 'manager') filter.assignedManagers = user._id;
  if (user.role === 'engineer') filter.assignedEngineers = user._id;
  return await Project.exists(filter);
};

const getProjectQuery = async (user) => {
  if (user.role === 'owner') return null;
  const filter = { companyId: user.companyId };
  if (user.role === 'manager') filter.assignedManagers = user._id;
  if (user.role === 'engineer') filter.assignedEngineers = user._id;
  
  const projects = await Project.find(filter, '_id');
  return { $in: projects.map(p => p._id) };
};

// Workers
router.route('/')
  .get(protect, async (req, res) => {
    try {
      let query = { companyId: req.user.companyId };
      const projFilter = await getProjectQuery(req.user);
      if (projFilter) query.projectId = projFilter;

      res.json(await Worker.find(query)); 
    } catch (e) { res.status(500).json({ message: e.message }); }
  })
  .post(protect, authorize('owner', 'manager'), async (req, res) => {
    try {
      if (!(await hasProjectAccess(req.user, req.body.projectId))) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }
      res.status(201).json(await Worker.create({ ...req.body, companyId: req.user.companyId }));
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

router.route('/:id')
  .put(protect, authorize('owner', 'manager'), async (req, res) => {
    try {
      const worker = await Worker.findOne({ _id: req.params.id, companyId: req.user.companyId });
      if (!worker) return res.status(404).json({ message: 'Not found' });

      if (!(await hasProjectAccess(req.user, worker.projectId))) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }

      Object.assign(worker, req.body);
      await worker.save();
      res.json(worker);
    } catch (e) { res.status(400).json({ message: e.message }); }
  })
  .delete(protect, authorize('owner'), async (req, res) => {
    try {
      const w = await Worker.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
      if (!w) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Removed' });
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

// Attendance (upsert or bulk)
router.post('/attendance/bulk', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { records } = req.body;
    
    // Verify all records belong to accessible projects
    for (const r of records) {
      if (!(await hasProjectAccess(req.user, r.projectId))) {
        return res.status(403).json({ message: `No access to project ${r.projectId}` });
      }
    }

    const ops = records.map(r => ({
      updateOne: {
        filter: { workerId: r.workerId, date: r.date, companyId: req.user.companyId },
        update: { $set: { ...r, companyId: req.user.companyId, markedBy: req.user._id } },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(ops);
    res.json({ message: 'Attendance saved' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.get('/attendance', protect, async (req, res) => {
  try {
    const { date, month } = req.query;
    let query = { companyId: req.user.companyId };
    
    const projFilter = await getProjectQuery(req.user);
    if (projFilter) query.projectId = projFilter;

    if (date) query.date = date;
    if (month) query.date = { $regex: `^${month}` };
    res.json(await Attendance.find(query));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
