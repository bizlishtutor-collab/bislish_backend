import mongoose from 'mongoose';

const notesSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true, 
    trim: true 
  },
  subject: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true,
    enum: ['IELTS preparation', 'Spoken English', 'English for competitive exams', 'GRE Vocabulary']
  },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Intermediate' 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  fileType: { 
    type: String, 
    required: true 
  },
  tags: [{ 
    type: String, 
    trim: true 
  }],
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  downloads: { 
    type: Number, 
    default: 0 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'archived'], 
    default: 'active' 
  }
}, { 
  timestamps: true 
});

// Indexes for better performance
notesSchema.index({ subject: 1, category: 1 });
notesSchema.index({ status: 1, isPublic: 1 });
notesSchema.index({ createdAt: -1 });
notesSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for formatted file size
notesSchema.virtual('formattedFileSize').get(function() {
  if (this.fileSize < 1024) return `${this.fileSize} B`;
  if (this.fileSize < 1024 * 1024) return `${(this.fileSize / 1024).toFixed(1)} KB`;
  return `${(this.fileSize / (1024 * 1024)).toFixed(1)} MB`;
});

// Ensure virtuals are serialized
notesSchema.set('toJSON', { virtuals: true });
notesSchema.set('toObject', { virtuals: true });

const Notes = mongoose.model('Notes', notesSchema);
export default Notes;