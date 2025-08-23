import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  featuredImage: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    enum: ['IELTS preparation', 'Spoken English', 'English for competitive exams', 'GRE Vocabulary']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    required: [true, 'Author name is required'],
    default: 'Admin'
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  // SEO fields
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  // Reading time and views
  readingTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  // Likes functionality
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
  // SEO and social
  featured: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create slug from title before saving
blogSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  // Calculate reading time (average 200 words per minute)
  const wordCount = this.content.split(/\s+/).length;
  this.readingTime = Math.ceil(wordCount / 200);
  
  // Set publishedAt if status is published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for better search performance
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Ensure virtuals are serialized
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;