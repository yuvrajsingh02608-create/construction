const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const DailyLog = require('../models/DailyLog');
const Project = require('../models/Project');

const getProjectQuery = async (user) => {
  if (user.role === 'owner') return null;
  const filter = { companyId: user.companyId };
  if (user.role === 'manager') filter.assignedManagers = user._id;
  if (user.role === 'engineer') filter.assignedEngineers = user._id;
  const projects = await Project.find(filter, '_id');
  return { $in: projects.map(p => p._id) };
};

router.route('/')
  .get(protect, async (req, res) => {
    try {
      let query = { companyId: req.user.companyId };
      const projFilter = await getProjectQuery(req.user);
      if (projFilter) query.projectId = projFilter;

      res.json(await DailyLog.find(query).sort({ createdAt: -1 }));
    } catch (e) { res.status(500).json({ message: e.message }); }
  })
  .post(protect, async (req, res) => {
    try { res.status(201).json(await DailyLog.create({ ...req.body, companyId: req.user.companyId, createdBy: req.user._id })); }
    catch (e) { res.status(400).json({ message: e.message }); }
  });

router.route('/:id')
  .put(protect, async (req, res) => {
    try {
      const log = await DailyLog.findOneAndUpdate({ _id: req.params.id, companyId: req.user.companyId }, req.body, { new: true });
      if (!log) return res.status(404).json({ message: 'Not found' });
      res.json(log);
    } catch (e) { res.status(400).json({ message: e.message }); }
  })
  .delete(protect, authorize('owner'), async (req, res) => {
    try {
      const log = await DailyLog.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
      if (!log) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Removed' });
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

module.exports = router;
