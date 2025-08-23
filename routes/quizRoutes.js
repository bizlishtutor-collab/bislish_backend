import express from 'express';
import {
  getAllQuizzes,
  getActiveQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizResult,
  getQuizResults,
  getAllQuizResults,
  getQuizStats
} from '../controllers/quizController.js';
import { requireSignIn, isAdmin } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// Admin routes - require admin authentication (specific routes first)
router.get('/', requireSignIn, isAdmin, getAllQuizzes);
router.get('/all-results', requireSignIn, isAdmin, getAllQuizResults);
router.post('/', requireSignIn, isAdmin, createQuiz);
router.get('/stats', requireSignIn, isAdmin, getQuizStats);

// Public routes (for students)
router.get('/active', getActiveQuizzes);
router.get('/:id', getQuizById);
router.post('/:quizId/submit', submitQuizResult);

// Admin routes - require admin authentication (parameterized routes)
router.get('/:id/results', requireSignIn, isAdmin, getQuizResults);
router.put('/:id', requireSignIn, isAdmin, updateQuiz);
router.delete('/:id', requireSignIn, isAdmin, deleteQuiz);

export default router; 