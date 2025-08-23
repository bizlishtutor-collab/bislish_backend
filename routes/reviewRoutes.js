import express from 'express';
import {
  getAllReviews,
  getPublicReviews,
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewStats,
  uploadReviewImage
} from '../controllers/reviewController.js';
import { requireSignIn, isAdmin } from '../Middlewares/authMiddlewares.js';
import { uploadCourseFiles, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public route - only for displaying reviews
router.get('/public', getPublicReviews);

// Admin routes - require admin authentication
router.get('/', requireSignIn, isAdmin, getAllReviews);
router.post('/', requireSignIn, isAdmin, createReview);
router.post('/upload-image', requireSignIn, isAdmin, uploadCourseFiles.single('image'), handleUploadError, uploadReviewImage);
router.get('/stats', requireSignIn, isAdmin, getReviewStats);
router.get('/:id', requireSignIn, isAdmin, getReviewById);
router.put('/:id', requireSignIn, isAdmin, updateReview);
router.delete('/:id', requireSignIn, isAdmin, deleteReview);

export default router; 