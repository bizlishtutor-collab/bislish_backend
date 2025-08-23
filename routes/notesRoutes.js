import express from 'express';
import {
  createNotes,
  getAllNotes,
  getPublicNotes,
  getNotesById,
  updateNotes,
  deleteNotes,
  downloadNotes,
  getNotesStats
} from '../controllers/notesController.js';
import { requireSignIn, isAdmin } from '../Middlewares/authMiddlewares.js';
import { uploadNotes } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicNotes);
router.get('/public/:id', getNotesById);
router.post('/download/:id', downloadNotes);

// Admin routes (protected)
router.get('/', requireSignIn, isAdmin, getAllNotes);
router.get('/stats', requireSignIn, isAdmin, getNotesStats);
router.get('/:id', requireSignIn, isAdmin, getNotesById);
router.post('/', requireSignIn, isAdmin, uploadNotes, createNotes);
router.put('/:id', requireSignIn, isAdmin, uploadNotes, updateNotes);
router.delete('/:id', requireSignIn, isAdmin, deleteNotes);

export default router; 