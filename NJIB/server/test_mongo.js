const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/buildtrack_pro')
  .then(() => {
    console.log('Connected to local MongoDB successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });
