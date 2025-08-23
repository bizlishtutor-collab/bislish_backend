import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByCategory,
  getCoursesByInstructor,
  searchCourses,
  getCourseStats
} from '../controllers/courseController.js';
import { uploadCourseFiles, handleUploadError } from '../middleware/uploadMiddleware.js';
import { requireSignIn, isAdmin } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// Public routes
router.get('/getall', getAllCourses);
router.get('/get/:id', getCourseById);
router.get('/category/:category', getCoursesByCategory);
router.get('/instructor/:instructorName', getCoursesByInstructor);
router.get('/search', searchCourses);
router.get('/stats', getCourseStats);

// Admin only routes - require admin authentication
router.post('/create', requireSignIn, isAdmin, uploadCourseFiles.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), handleUploadError, createCourse);
router.put('/update/:id', requireSignIn, isAdmin, uploadCourseFiles.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), handleUploadError, updateCourse);
router.delete('/delete/:id', requireSignIn, isAdmin, deleteCourse);

export default router; 