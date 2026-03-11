const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Project = require('../models/Project');

// Helper to build role-based project query
const getProjectQuery = (user, extraQuery = {}) => {
  let query = { companyId: user.companyId, ...extraQuery };
  if (user.role === 'manager') {
    query.assignedManagers = user._id;
  } else if (user.role === 'engineer') {
    query.assignedEngineers = user._id;
  }
  return query;
};

// @route   GET /api/projects
// @desc    Get all active/assigned projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find(getProjectQuery(req.user)).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne(getProjectQuery(req.user, { _id: req.params.id }));
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create a project
router.post('/', protect, authorize('owner'), async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user._id,
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
router.put('/:id', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    // Only owners, or managers who are assigned to the project can update it
    const query = req.user.role === 'owner' 
      ? { _id: req.params.id, companyId: req.user.companyId }
      : { _id: req.params.id, companyId: req.user.companyId, assignedManagers: req.user._id };
      
    const project = await Project.findOneAndUpdate(
      query,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/projects/:id/assign
// @desc    Assign managers or engineers to a project (Owner only)
router.put('/:id/assign', protect, authorize('owner'), async (req, res) => {
  try {
    const { assignedManagers, assignedEngineers } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { assignedManagers, assignedEngineers },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
