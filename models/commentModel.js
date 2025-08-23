import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  author: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: [{
    userEmail: {
      type: String,
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isAdminComment: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
commentSchema.index({ blogId: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ status: 1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Ensure virtuals are serialized
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Comment', commentSchema); 