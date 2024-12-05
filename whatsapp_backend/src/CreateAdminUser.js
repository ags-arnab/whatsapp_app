// CreateAdminUser.js (Run this script separately)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { MONGODB_URI } = require('./config/config');

const createAdminUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    const email = 'admin@example.com';
    const password = 'your_admin_password';

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const adminUser = new User({
        email,
        password: hashedPassword,
        fullName: 'Admin User',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.disconnect();
  }
};

createAdminUser();