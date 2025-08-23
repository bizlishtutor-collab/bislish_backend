import Course from '../models/courseModel.js';

// Create a new course
export const createCourse = async (req, res) => {
  try {
    console.log('=== CREATE COURSE CALLED ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('User from middleware:', req.user);
    
    const {
      title,
      description,
      category,
      video,
      image,
      syllabus,
      features,
      duration,
      instructorName,
      status,
      level,
      tags,
      requirements,
      learningOutcomes
    } = req.body;

    console.log('Extracted form data:', {
      title,
      description,
      category,
      syllabus,
      instructorName,
      status,
      level,
      duration
    });

    // Validate required fields
    if (!title || !description || !category || !syllabus || !instructorName) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    console.log('Validation passed - all required fields present');

    // Handle file uploads
    let videoPath = '';
    let imagePath = '';

    if (req.files) {
      console.log('Processing uploaded files...');
      if (req.files.video && req.files.video[0]) {
        videoPath = `/uploads/videos/${req.files.video[0].filename}`;
        console.log('Video file processed:', videoPath);
      }
      if (req.files.image && req.files.image[0]) {
        imagePath = `/uploads/images/${req.files.image[0].filename}`;
        console.log('Image file processed:', imagePath);
      }
    } else {
      console.log('No files uploaded');
    }

    // Parse JSON strings if they exist
    let parsedFeatures = [];
    let parsedTags = [];
    let parsedRequirements = [];
    let parsedLearningOutcomes = [];
    let parsedDuration = {};

    try {
      if (features) parsedFeatures = JSON.parse(features);
      if (tags) parsedTags = JSON.parse(tags);
      if (requirements) parsedRequirements = JSON.parse(requirements);
      if (learningOutcomes) parsedLearningOutcomes = JSON.parse(learningOutcomes);
      if (duration) parsedDuration = JSON.parse(duration);
      console.log('JSON parsing completed successfully');
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
    }

    // Validate duration dates
    if (parsedDuration && parsedDuration.startDate && parsedDuration.endDate) {
      if (new Date(parsedDuration.startDate) >= new Date(parsedDuration.endDate)) {
        console.log('Duration validation failed - end date must be after start date');
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
      console.log('Duration validation passed');
    }

    // Create new course
    const courseData = {
      title,
      description,
      category,
      video: videoPath,
      image: imagePath,
      syllabus,
      features: parsedFeatures,
      duration: parsedDuration,
      instructorName,
      status: status || 'upcoming',
      level: level || 'beginner',
      tags: parsedTags,
      requirements: parsedRequirements,
      learningOutcomes: parsedLearningOutcomes
    };
    
    console.log('Course data to save:', courseData);
    
    const course = new Course(courseData);
    console.log('Course model instance created, attempting to save...');
    
    const savedCourse = await course.save();
    
    console.log('Course saved successfully:', savedCourse);

    const response = {
      success: true,
      message: 'Course created successfully',
      data: savedCourse
    };
    
    console.log('Sending response:', response);
    res.status(201).json(response);

  } catch (error) {
    console.error('Error creating course:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      console.log('Validation errors:', validationErrors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    console.log('getAllCourses called with query:', req.query);
    
    const { 
      category, 
      status, 
      level, 
      instructor, 
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (level) filter.level = level;
    if (instructor) filter.instructorName = { $regex: instructor, $options: 'i' };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructorName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const courses = await Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('instructorName', 'name email');

    // Get total count for pagination
    const total = await Course.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: courses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      video,
      image,
      syllabus,
      features,
      duration,
      instructorName,
      status,
      level,
      tags,
      requirements,
      learningOutcomes
    } = req.body;

    // Check if course exists
    const existingCourse = await Course.findById(req.params.id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Handle file uploads
    let videoPath = existingCourse.video || '';
    let imagePath = existingCourse.image || '';

    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        videoPath = `/uploads/videos/${req.files.video[0].filename}`;
      }
      if (req.files.image && req.files.image[0]) {
        imagePath = `/uploads/images/${req.files.image[0].filename}`;
      }
    } else {
      // Use provided paths if no files uploaded
      if (video) videoPath = video;
      if (image) imagePath = image;
    }

    // Parse JSON strings if they exist
    let parsedFeatures = existingCourse.features;
    let parsedTags = existingCourse.tags;
    let parsedRequirements = existingCourse.requirements;
    let parsedLearningOutcomes = existingCourse.learningOutcomes;
    let parsedDuration = existingCourse.duration;

    try {
      if (features) parsedFeatures = JSON.parse(features);
      if (tags) parsedTags = JSON.parse(tags);
      if (requirements) parsedRequirements = JSON.parse(requirements);
      if (learningOutcomes) parsedLearningOutcomes = JSON.parse(learningOutcomes);
      if (duration) parsedDuration = JSON.parse(duration);
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
    }

    // Validate duration dates if provided
    if (parsedDuration && parsedDuration.startDate && parsedDuration.endDate) {
      if (new Date(parsedDuration.startDate) >= new Date(parsedDuration.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title: title || existingCourse.title,
        description: description || existingCourse.description,
        category: category || existingCourse.category,
        video: videoPath,
        image: imagePath,
        syllabus: syllabus || existingCourse.syllabus,
        features: parsedFeatures,
        duration: parsedDuration,
        instructorName: instructorName || existingCourse.instructorName,
        status: status || existingCourse.status,
        level: level || existingCourse.level,
        tags: parsedTags,
        requirements: parsedRequirements,
        learningOutcomes: parsedLearningOutcomes
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// Get courses by category
export const getCoursesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const courses = await Course.find({ category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments({ category });

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: courses
    });

  } catch (error) {
    console.error('Error fetching courses by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses by category',
      error: error.message
    });
  }
};

// Get courses by instructor
export const getCoursesByInstructor = async (req, res) => {
  try {
    const { instructorName } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const courses = await Course.find({ 
      instructorName: { $regex: instructorName, $options: 'i' } 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments({ 
      instructorName: { $regex: instructorName, $options: 'i' } 
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: courses
    });

  } catch (error) {
    console.error('Error fetching courses by instructor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses by instructor',
      error: error.message
    });
  }
};

// Search courses
export const searchCourses = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { instructorName: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { instructorName: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: courses
    });

  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching courses',
      error: error.message
    });
  }
};

// Get course statistics
export const getCourseStats = async (req, res) => {
  try {
    const stats = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalActive: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalUpcoming: { $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] } },
          totalInactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Course.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const levelStats = await Course.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {},
        byCategory: categoryStats,
        byLevel: levelStats
      }
    });

  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course statistics',
      error: error.message
    });
  }
}; 