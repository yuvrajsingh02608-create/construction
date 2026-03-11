const mongoose = require('mongoose');

const checkDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/buildtrack_pro');
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      role: String,
      companyId: mongoose.Schema.Types.ObjectId
    }));
    
    const Project = mongoose.model('Project', new mongoose.Schema({
      name: String,
      assignedManagers: Array,
      assignedEngineers: Array,
      companyId: mongoose.Schema.Types.ObjectId
    }));
    
    const users = await User.find({}, 'name role');
    console.log('USERS:', JSON.stringify(users, null, 2));
    
    const projects = await Project.find({}, 'name assignedManagers assignedEngineers');
    console.log('PROJECTS:', JSON.stringify(projects, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkDB();
