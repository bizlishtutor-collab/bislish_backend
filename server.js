import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js'; // Importing routes
import teacherRoutes from './routes/teacherRoutes.js'; // Importing teacher routes
import contactRoutes from './routes/contactRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import courseRoutes from './routes/courseRoutes.js'; // Importing course routes
import videoRoutes from './routes/videoRoutes.js'; // Importing video routes
import reviewRoutes from './routes/reviewRoutes.js'; // Importing review routes
import quizRoutes from './routes/quizRoutes.js'; // Importing quiz routes
import blogRoutes from './routes/blogRoutes.js'; // Importing blog routes
import commentRoutes from './routes/commentRoutes.js'; // Importing comment routes
import notesRoutes from './routes/notesRoutes.js'; // Importing notes routes

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Check if environment variables are loaded


// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/contacts', contactRoutes);
app.use('/api/teachers', teacherRoutes); // Mount teacher routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes); // Mount course routes
app.use('/api/videos', videoRoutes); // Mount video routes
app.use('/api/reviews', reviewRoutes); // Mount review routes
app.use('/api/quizzes', quizRoutes); // Mount quiz routes
app.use('/api/blogs', blogRoutes); // Mount blog routes
app.use('/api/comments', commentRoutes); // Mount comment routes
app.use('/api/notes', notesRoutes); // Mount notes routes

// Basic route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Tutor Web Application</h1>');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Set the PORT from environment variables or default to 8000
const PORT = process.env.PORT || 8000;

// Start server
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
