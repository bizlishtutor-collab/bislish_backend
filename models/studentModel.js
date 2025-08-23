import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  qualification: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
  }],
  courseNames: [{
    type: String,
    required: false,
    trim: true,
  }],
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
