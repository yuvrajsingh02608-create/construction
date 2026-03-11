const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper to verify if user has access to project
const hasProjectAccess = async (user, projectId) => {
  if (user.role === 'owner') return true;
  const filter = { _id: projectId, companyId: user.companyId };
  if (user.role === 'manager') filter.assignedManagers = user._id;
  if (user.role === 'engineer') filter.assignedEngineers = user._id;
  return await Project.exists(filter);
};

router.route('/')
  .get(protect, async (req, res) => {
    try {
      let query = { companyId: req.user.companyId };
      if (req.user.role === 'engineer') {
        query.assigneeId = req.user._id;
      } else if (req.user.role === 'manager') {
        const projects = await Project.find({ companyId: req.user.companyId, assignedManagers: req.user._id }, '_id');
        query.projectId = { $in: projects.map(p => p._id) };
      }
      const tasks = await Task.find(query).sort({ createdAt: -1 });
      res.json(tasks);
    } catch (e) { res.status(500).json({ message: e.message }); }
  })
  .post(protect, authorize('owner', 'manager'), async (req, res) => {
    try {
      if (!(await hasProjectAccess(req.user, req.body.projectId))) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }
      const task = await Task.create({ ...req.body, companyId: req.user.companyId, createdBy: req.user._id });
      res.status(201).json(task);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

router.route('/:id')
  .put(protect, async (req, res) => {
    try {
      const task = await Task.findOne({ _id: req.params.id, companyId: req.user.companyId });
      if (!task) return res.status(404).json({ message: 'Task not found' });

      if (!(await hasProjectAccess(req.user, task.projectId))) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }

      // Engineers can only update status
      if (req.user.role === 'engineer') {
        const { status } = req.body;
        task.status = status;
        await task.save();
        return res.json(task);
      }

      const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (e) { res.status(400).json({ message: e.message }); }
  })
  .delete(protect, authorize('owner', 'manager'), async (req, res) => {
    try {
      const task = await Task.findOne({ _id: req.params.id, companyId: req.user.companyId });
      if (!task) return res.status(404).json({ message: 'Task not found' });

      if (!(await hasProjectAccess(req.user, task.projectId))) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }

      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

module.exports = router;
