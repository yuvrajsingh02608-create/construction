const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Material = require('../models/Material');
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

router.route('/')
  .get(protect, async (req, res) => {
    try {
      let query = { companyId: req.user.companyId };
      const projFilter = await getProjectQuery(req.user);
      if (projFilter) query.projectId = projFilter;

      res.json(await Material.find(query));
    } catch (e) { res.status(500).json({ message: e.message }); }
  })
  .post(protect, authorize('owner', 'manager'), async (req, res) => {
    try {
      if (!(await hasProjectAccess(req.user, req.body.projectId))) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }
      res.status(201).json(await Material.create({ ...req.body, companyId: req.user.companyId, updatedBy: req.user._id }));
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

router.route('/:id')
  .put(protect, authorize('owner', 'manager'), async (req, res) => {
    try {
      const mat = await Material.findOne({ _id: req.params.id, companyId: req.user.companyId });
      if (!mat) return res.status(404).json({ message: 'Not found' });

      if (!(await hasProjectAccess(req.user, mat.projectId))) {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }

      Object.assign(mat, req.body, { updatedBy: req.user._id });
      await mat.save();
      res.json(mat);
    } catch (e) { res.status(400).json({ message: e.message }); }
  })
  .delete(protect, authorize('owner'), async (req, res) => {
    try {
      const mat = await Material.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
      if (!mat) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Removed' });
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

module.exports = router;
