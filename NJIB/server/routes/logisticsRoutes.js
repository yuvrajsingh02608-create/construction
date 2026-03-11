const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Logistics = require('../models/Logistics');

// @route   GET /api/logistics
// @desc    Get all logistics entries
router.get('/', protect, async (req, res) => {
  try {
    const logistics = await Logistics.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
    res.json(logistics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/logistics
// @desc    Create a logistics entry
router.post('/', protect, async (req, res) => {
  try {
    const logistics = await Logistics.create({
      ...req.body,
      companyId: req.user.companyId,
    });
    res.status(201).json(logistics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/logistics/:id
// @desc    Update a logistics entry
router.put('/:id', protect, async (req, res) => {
  try {
    const logistics = await Logistics.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true }
    );
    if (!logistics) return res.status(404).json({ message: 'Entry not found' });
    res.json(logistics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/logistics/:id
// @desc    Delete a logistics entry
router.delete('/:id', protect, async (req, res) => {
  try {
    const logistics = await Logistics.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!logistics) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
