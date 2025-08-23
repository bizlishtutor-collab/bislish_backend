import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = "mongodb+srv://areeba:areeba@dbms.imoaaqd.mongodb.net/";
    
    if (!mongoUri) {
     
      process.exit(1);
    }
    
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📍 URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB Database: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error in MongoDB Connection: ${error.message}`);
    console.log('💡 Make sure you have:');
    console.log('   1. Created a .env file with MONGODB_URI');
    console.log('   2. Set up MongoDB Atlas or local MongoDB');
    console.log('   3. Network access is configured correctly');
    console.log('   4. MongoDB service is running (if using local)');
    console.log('   5. IP address is whitelisted (if using Atlas)');
    process.exit(1);
  }
};

export default connectDB;
