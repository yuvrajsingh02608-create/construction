const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Bypass for Demo Mode
      if (token === 'demo-token') {
        let demoUser = await User.findOne({ companyId: 'demo' });
        if (!demoUser) {
          demoUser = await User.findOne(); // Any existing user
        }
        if (!demoUser) {
          demoUser = await User.create({ 
            name: 'Demo Supervisor', 
            email: 'supervisor@demo.com', 
            role: 'supervisor', 
            companyId: 'demo' 
          });
        }
        req.user = demoUser;
        return next();
      }

      // Decode the Firebase JWT (RS256) to extract the UID (user_id)
      // Since this is a hybrid local dev setup, decoding is sufficient.
      // In production, use Firebase Admin SDK to verify the token signature.
      const decoded = jwt.decode(token);
      
      if (!decoded || (!decoded.user_id && !decoded.uid)) {
        return res.status(401).json({ message: 'Invalid Firebase Token' });
      }

      const uid = decoded.user_id || decoded.uid;
      req.user = await User.findOne({ firebaseUid: uid });
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not synced with MongoDB yet' });
      }
      
      next();
    } catch (error) {
      console.error('Auth Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized` });
    }
    next();
  };
};

module.exports = { protect, authorize };
