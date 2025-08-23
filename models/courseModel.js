import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['IELTS preparation', 'Spoken English', 'English for competitive exams', 'GRE Vocabulary']
  },
  video: {
    type: String,
    required: [true, 'Course video is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Course image is required'],
    trim: true
  },
  syllabus: {
    type: String,
    required: [true, 'Course syllabus is required'],
    trim: true
  },
  features: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 10; // Maximum 10 features
      },
      message: 'Features cannot exceed 10 items'
    }
  },
  duration: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    }
  },
  instructorName: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true,
    maxlength: [50, 'Instructor name cannot exceed 50 characters']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  maxStudents: {
    type: Number,
    default: 50,
    min: [1, 'Maximum students must be at least 1']
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: [0, 'Current students cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'upcoming'],
    default: 'upcoming'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: {
    type: [String],
    default: []
  },
  requirements: {
    type: [String],
    default: []
  },
  learningOutcomes: {
    type: [String],
    default: []
  }
}, { 
  timestamps: true 
});

// Index for better query performance
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructorName: 1 });
courseSchema.index({ 'duration.startDate': 1 });

// Virtual for duration in days
courseSchema.virtual('durationInDays').get(function() {
  if (this.duration.startDate && this.duration.endDate) {
    const diffTime = Math.abs(this.duration.endDate - this.duration.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - this.currentStudents;
});

// Virtual for enrollment percentage
courseSchema.virtual('enrollmentPercentage').get(function() {
  if (this.maxStudents === 0) return 0;
  return Math.round((this.currentStudents / this.maxStudents) * 100);
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate dates
courseSchema.pre('save', function(next) {
  if (this.duration.startDate && this.duration.endDate) {
    if (this.duration.startDate >= this.duration.endDate) {
      return next(new Error('End date must be after start date'));
    }
  }
  next();
});

export default mongoose.model('Course', courseSchema);