import { body, validationResult } from 'express-validator';

// Validation rules for teacher creation/update
export const validateTeacher = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('contactNumber')
        .trim()
        .isLength({ min: 10, max: 15 })
        .withMessage('Contact number must be between 10 and 15 characters'),
    
    body('address')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Address must be between 5 and 200 characters'),
    
    body('city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),
    
    body('country')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Country must be between 2 and 50 characters'),
    
    body('state')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('State must be between 2 and 50 characters'),
    
    body('zipCode')
        .trim()
        .isLength({ min: 3, max: 10 })
        .withMessage('Zip code must be between 3 and 10 characters'),
    
    body('gender')
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must be Male, Female, or Other'),
    
    body('dateOfBirth')
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),
    
    body('qualification')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Qualification must be between 2 and 100 characters'),
    
    body('subject')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Subject must be between 2 and 50 characters'),
    
    body('expertAt')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Expert at must be between 5 and 200 characters'),
    
    body('appliedFor')
        .isIn(['IELTS', 'English', 'Quran'])
        .withMessage('Applied for must be IELTS, English, or Quran'),
    
    body('whyFitForJob')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Why you fit for this job must be between 10 and 1000 characters')
];

// Middleware to check for validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
}; 