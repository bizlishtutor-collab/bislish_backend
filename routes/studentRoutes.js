import express from 'express';
import {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';
import { requireSignIn, isAdmin } from '../Middlewares/authMiddlewares.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for handling form data
const upload = multer();

// Public route for student enrollment
router.post('/', upload.none(), addStudent);

// Admin only routes - require admin authentication
router.get('/', requireSignIn, isAdmin, getAllStudents);
router.get('/:id', requireSignIn, isAdmin, getStudentById);
router.put('/:id', requireSignIn, isAdmin, upload.none(), updateStudent);
router.delete('/:id', requireSignIn, isAdmin, deleteStudent);

export default router;
