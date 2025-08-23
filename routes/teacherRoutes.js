import express from 'express';
import {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getTeachersBySubject,
    searchTeachers
} from '../controllers/teacherController.js';
import { uploadTeacherFiles, handleUploadError } from '../middleware/uploadMiddleware.js';
import { validateTeacher, handleValidationErrors } from '../middleware/teacherValidation.js';
import { requireSignIn, isAdmin } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// Create a new teacher with file uploads
router.post('/add',
    uploadTeacherFiles.fields([
        { name: 'image', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]),
    handleUploadError,
    validateTeacher,
    handleValidationErrors,
    createTeacher
);

// Public route - anyone can submit teacher application
router.post('/',
    uploadTeacherFiles.fields([
        { name: 'image', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]),
    handleUploadError,
    validateTeacher,
    handleValidationErrors,
    createTeacher
);

// Admin only routes - require admin authentication
router.get('/getall', requireSignIn, isAdmin, getAllTeachers);
router.get('/get/:id', requireSignIn, isAdmin, getTeacherById);
router.put('/update/:id', requireSignIn, isAdmin,
    uploadTeacherFiles.fields([
        { name: 'image', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]),
    handleUploadError,
    validateTeacher,
    handleValidationErrors,
    updateTeacher
);
router.delete('/:id', requireSignIn, isAdmin, deleteTeacher);
router.get('/subject/:appliedFor', requireSignIn, isAdmin, getTeachersBySubject);
router.get('/search', requireSignIn, isAdmin, searchTeachers);

export default router; 