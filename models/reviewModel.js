import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: false,
    trim: true,
  },
  review: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Index for better query performance
reviewSchema.index({ status: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review; 