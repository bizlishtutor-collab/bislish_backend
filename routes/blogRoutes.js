import express from 'express';
import {
  getAllBlogs,
  getPublishedBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogStats,
  uploadBlogImage,
  toggleBlogLike
} from '../controllers/blogController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';
import { uploadCourseFiles, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/published', getPublishedBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.post('/:blogId/like', toggleBlogLike);

// Protected routes (admin only)
router.use(requireSignIn);

// Admin routes
router.get('/', getAllBlogs);
router.get('/stats', getBlogStats);
router.get('/:id', getBlogById);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);
router.post('/upload-image', uploadCourseFiles.single('image'), handleUploadError, uploadBlogImage);

export default router; 