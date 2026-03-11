const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/auth/sync
router.post('/sync', async (req, res) => {
  try {
    const { token, role, phone, name } = req.body;
    
    // Decode Firebase token
    const decoded = jwt.decode(token);
    if (!decoded || (!decoded.user_id && !decoded.uid)) {
      return res.status(400).json({ message: 'Invalid Firebase token' });
    }

    const firebaseUid = decoded.user_id || decoded.uid;
    const email = decoded.email || '';
    const displayName = name || decoded.name || email.split('@')[0] || 'Unknown User';

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          user.firebaseUid = firebaseUid;
          await user.save();
        }
      }
      
      if (!user) {
        user = await User.create({
          firebaseUid,
          name: displayName || phone || 'User',
          email: email || undefined,
          role: role || 'engineer', // default role
          phone: phone || '',
          avatar: decoded.picture || ''
        });

        // If they registered as an owner, create a company for them
        if (user.role === 'owner') {
          const company = await Company.create({
            name: `${displayName}'s Company`,
            ownerId: user._id
          });
          user.companyId = company._id;
          await user.save();
        }
      }
    }

    user.lastLogin = Date.now();
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) res.json(user);
  else res.status(404).json({ message: 'User not found' });
});

// @route   GET /api/auth/users
// @desc    Get users for a company (Filtered by role)
router.get('/users', protect, async (req, res) => {
  try {
    let query = { companyId: req.user.companyId };
    
    // Strict Peer Isolation
    if (req.user.role === 'manager') {
      // Managers see themselves and all engineers
      query.$or = [
        { _id: req.user._id },
        { role: 'engineer' }
      ];
    } else if (req.user.role === 'engineer') {
      // Engineers only see themselves
      query._id = req.user._id;
    }
    // Owners see all (default query)

    const users = await User.find(query).select('-firebaseUid');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user from the company
router.delete('/users/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
