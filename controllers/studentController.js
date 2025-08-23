import Student from '../models/studentModel.js';

// Add new student
export const addStudent = async (req, res) => {
  try {
    // Extract data from request body (handles both JSON and FormData)
    const studentData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      city: req.body.city,
      qualification: req.body.qualification,
    };

    // Handle course selection
    if (req.body.courses) {
      try {
        const courses = JSON.parse(req.body.courses);
        studentData.courses = courses;
      } catch (e) {
        console.error('Error parsing courses:', e);
      }
    }

    if (req.body.courseNames) {
      try {
        const courseNames = JSON.parse(req.body.courseNames);
        studentData.courseNames = courseNames;
      } catch (e) {
        console.error('Error parsing course names:', e);
      }
    }

    const student = new Student(studentData);
    await student.save();
    res.status(201).json({ success: true, student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    console.log('getAllStudents called');
    const students = await Student.find()
      .populate('courses', 'title category level price')
      .sort({ createdAt: -1 });
    console.log('Found students:', students.length);
    res.status(200).json({ 
      success: true, 
      data: students,
      count: students.length 
    });
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('courses', 'title category level price');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    // Extract data from request body (handles both JSON and FormData)
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      city: req.body.city,
      qualification: req.body.qualification,
    };

    // Handle course selection
    if (req.body.courses) {
      try {
        const courses = JSON.parse(req.body.courses);
        updateData.courses = courses;
      } catch (e) {
        console.error('Error parsing courses:', e);
      }
    }

    if (req.body.courseNames) {
      try {
        const courseNames = JSON.parse(req.body.courseNames);
        updateData.courseNames = courseNames;
      } catch (e) {
        console.error('Error parsing course names:', e);
      }
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('courses', 'title category level price');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
