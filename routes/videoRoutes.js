import express from 'express';
import {
  uploadCourseVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getVideosByCategory,
  searchVideos,
  getVideoStats
} from '../controllers/videoController.js';
import { uploadVideo, handleUploadError } from '../middleware/uploadMiddleware.js';
import { requireSignIn, isAdmin } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// Public routes
router.get('/getall', getAllVideos);
router.get('/get/:id', getVideoById);
router.get('/category/:category', getVideosByCategory);
router.get('/search', searchVideos);
router.get('/stats', getVideoStats);

// Admin only routes - require admin authentication
router.post('/upload', requireSignIn, isAdmin, uploadVideo, handleUploadError, uploadCourseVideo);
router.put('/update/:id', requireSignIn, isAdmin, updateVideo);
router.delete('/delete/:id', requireSignIn, isAdmin, deleteVideo);

export default router; 