import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import auth from './models/authModel.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tutor_web';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await auth.findOne({ email: 'admin1@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = new auth({
      name: 'Admin User',
      email: 'admin1@example.com',
      password: hashedPassword,
      phone: '1234567890',
      address: 'Admin Address',
      answer: 'admin',
      role: 1  // 1 for admin, 0 for user
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin1@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin(); 