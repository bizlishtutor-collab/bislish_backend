import Teacher from '../models/teacherModel.js';

// Create a new teacher
export const createTeacher = async (req, res) => {
    try {
        const {
            name,
            email,
            contactNumber,
            address,
            city,
            country,
            state,
            zipCode,
            gender,
            dateOfBirth,
            qualification,
            subject,
            expertAt,
            appliedFor,
            whyFitForJob
        } = req.body;

        // Check if image and resume files are uploaded
        if (!req.files || !req.files.image || !req.files.resume) {
            return res.status(400).json({
                success: false,
                message: 'Both image and resume files are required'
            });
        }

        // Create new teacher with file paths
        const teacher = new Teacher({
            name,
            email,
            contactNumber,
            address,
            city,
            country,
            state,
            zipCode,
            gender,
            dateOfBirth,
            qualification,
            subject,
            expertAt,
            appliedFor,
            whyFitForJob,
            image: req.files.image[0].filename,
            resume: req.files.resume[0].filename
        });

        const savedTeacher = await teacher.save();

        res.status(201).json({
            success: true,
            message: 'Teacher application submitted successfully',
            data: savedTeacher
        });

    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating teacher application',
            error: error.message
        });
    }
};

// Get all teachers
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: teachers.length,
            data: teachers
        });

    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teachers',
            error: error.message
        });
    }
};

// Get teacher by ID
export const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            data: teacher
        });

    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher',
            error: error.message
        });
    }
};

// Update teacher
export const updateTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const updateData = { ...req.body };

        // Handle file updates if new files are uploaded
        if (req.files) {
            if (req.files.image) {
                updateData.image = req.files.image[0].filename;
            }
            if (req.files.resume) {
                updateData.resume = req.files.resume[0].filename;
            }
        }

        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Teacher updated successfully',
            data: updatedTeacher
        });

    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating teacher',
            error: error.message
        });
    }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Teacher deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting teacher',
            error: error.message
        });
    }
};

// Get teachers by applied subject
export const getTeachersBySubject = async (req, res) => {
    try {
        const { appliedFor } = req.params;
        
        const teachers = await Teacher.find({ appliedFor }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: teachers.length,
            data: teachers
        });

    } catch (error) {
        console.error('Error fetching teachers by subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teachers by subject',
            error: error.message
        });
    }
};

// Search teachers
export const searchTeachers = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const teachers = await Teacher.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { subject: { $regex: query, $options: 'i' } },
                { appliedFor: { $regex: query, $options: 'i' } },
                { qualification: { $regex: query, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: teachers.length,
            data: teachers
        });

    } catch (error) {
        console.error('Error searching teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching teachers',
            error: error.message
        });
    }
}; 