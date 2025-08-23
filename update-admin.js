import mongoose from 'mongoose';
import auth from './models/authModel.js';
import dotenv from 'dotenv';

dotenv.config();

const updateAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tutor_web';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find the user with admin1@example.com
    const user = await auth.findOne({ email: 'admin1@example.com' });
    
    if (!user) {
      console.log('User with email admin1@example.com not found');
      console.log('Creating new admin user...');
      
      // Create new admin user
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
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
    } else {
      // Update existing user to admin
      user.role = 1;
      await user.save();
      console.log('User updated to admin successfully');
    }

    console.log('Email: admin1@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error updating admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

updateAdmin(); 