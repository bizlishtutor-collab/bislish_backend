import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['IELTS preparation', 'Spoken English', 'English for competitive exams', 'GRE Vocabulary']
  },
  video: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  syllabus: {
    type: String,
    trim: true
  },
  features: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    default: 0
  },
  maxStudents: {
    type: Number,
    default: 50
  },
  currentStudents: {
    type: Number,
    default: 0
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


export default mongoose.model('Course', courseSchema);