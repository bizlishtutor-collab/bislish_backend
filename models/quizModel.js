import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: [{ type: String, required: true, trim: true }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 }, // Index of correct option (0-3)
  explanation: { type: String, trim: true, default: '' }
});

const quizResultSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, // Changed from ObjectId to String
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  score: { type: Number, required: true, min: 0 }, // Raw marks (0 to total questions)
  totalQuestions: { type: Number, required: true, default: 40 },
  passed: { type: Boolean, required: true },
  answers: [{
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  timeTaken: { type: Number, default: 0 }, // in seconds
  completedAt: { type: Date, default: Date.now }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  questions: [questionSchema],
  totalQuestions: { type: Number, required: true, default: 40 },
  passingScore: { type: Number, required: true, default: 28 }, // 70% of 40 questions
  timeLimit: { type: Number, default: 30 }, // in minutes
  isActive: { type: Boolean, default: true },
  category: { 
    type: String, 
    trim: true, 
    default: 'IELTS preparation',
    enum: ['IELTS preparation', 'Spoken English', 'English for competitive exams', 'GRE Vocabulary']
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  results: [quizResultSchema]
}, { timestamps: true });

// Indexes for better performance
quizSchema.index({ isActive: 1, category: 1 });
quizSchema.index({ 'results.studentId': 1 });
quizSchema.index({ createdAt: -1 });

// Virtual for total attempts
quizSchema.virtual('totalAttempts').get(function() {
  return this.results.length;
});

// Virtual for average score
quizSchema.virtual('averageScore').get(function() {
  if (this.results.length === 0) return 0;
  const totalScore = this.results.reduce((sum, result) => sum + result.score, 0);
  return Math.round((totalScore / this.results.length) * 100) / 100;
});

// Virtual for pass rate
quizSchema.virtual('passRate').get(function() {
  if (this.results.length === 0) return 0;
  const passedCount = this.results.filter(result => result.passed).length;
  return Math.round((passedCount / this.results.length) * 100);
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;