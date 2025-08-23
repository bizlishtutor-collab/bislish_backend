import express from 'express';
import {
  createComment,
  getBlogComments,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  toggleLike,
  getCommentStats
} from '../controllers/commentController.js';
import { requireSignIn, isAdmin } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// Public routes
router.post('/create', createComment);
router.get('/blog/:blogId', getBlogComments);
router.post('/:commentId/like', toggleLike);

// Admin routes (protected)
router.use(requireSignIn);
router.use(isAdmin);

router.get('/admin/all', getAllComments);
router.get('/admin/stats', getCommentStats);
router.put('/admin/:commentId/status', updateCommentStatus);
router.delete('/admin/:commentId', deleteComment);

export default router; 