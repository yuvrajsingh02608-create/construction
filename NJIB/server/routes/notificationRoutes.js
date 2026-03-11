const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

router.route('/')
  .get(protect, async (req, res) => {
    try { res.json(await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 })); }
    catch (e) { res.status(500).json({ message: e.message }); }
  })
  .post(protect, async (req, res) => {
    try { res.status(201).json(await Notification.create({ ...req.body, userId: req.user._id, companyId: req.user.companyId })); }
    catch (e) { res.status(400).json({ message: e.message }); }
  });

router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'All marked read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.route('/:id')
  .put(protect, async (req, res) => {
    try {
      const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
      if (!n) return res.status(404).json({ message: 'Not found' });
      res.json(n);
    } catch (e) { res.status(400).json({ message: e.message }); }
  })
  .delete(protect, async (req, res) => {
    try {
      const n = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!n) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Removed' });
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

module.exports = router;
