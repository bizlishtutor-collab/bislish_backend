import Quiz from '../models/quizModel.js';

// Get all quizzes (admin only)
export const getAllQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, category, difficulty } = req.query;
    
    // Build filter object
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get quizzes with pagination
    const quizzes = await Quiz.find(filter)
      .select('-questions.correctAnswer -questions.explanation') // Don't send correct answers
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Convert to plain objects to include virtuals

    // Add virtual properties manually since lean() doesn't include them
    const quizzesWithVirtuals = quizzes.map(quiz => ({
      ...quiz,
      totalAttempts: quiz.results ? quiz.results.length : 0,
      averageScore: quiz.results && quiz.results.length > 0 
        ? Math.round((quiz.results.reduce((sum, result) => sum + result.score, 0) / quiz.results.length) * 100) / 100
        : 0,
      passRate: quiz.results && quiz.results.length > 0
        ? Math.round((quiz.results.filter(result => result.passed).length / quiz.results.length) * 100)
        : 0
    }));

    // Get total count for pagination
    const total = await Quiz.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: quizzesWithVirtuals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting quizzes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active quizzes (for students)
export const getActiveQuizzes = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const quizzes = await Quiz.find(filter)
      .select('title description category difficulty totalQuestions timeLimit results')
      .sort({ createdAt: -1 })
      .lean();

    // Add virtual properties manually
    const quizzesWithVirtuals = quizzes.map(quiz => ({
      ...quiz,
      totalAttempts: quiz.results ? quiz.results.length : 0,
      averageScore: quiz.results && quiz.results.length > 0 
        ? Math.round((quiz.results.reduce((sum, result) => sum + result.score, 0) / quiz.results.length) * 100) / 100
        : 0,
      passRate: quiz.results && quiz.results.length > 0
        ? Math.round((quiz.results.filter(result => result.passed).length / quiz.results.length) * 100)
        : 0
    }));

    res.status(200).json({
      success: true,
      data: quizzesWithVirtuals
    });
  } catch (error) {
    console.error('Error getting active quizzes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quiz by ID (without correct answers for students)
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeAnswers = false } = req.query;

    let quiz;
    if (includeAnswers === 'true') {
      // Admin view - include correct answers
      quiz = await Quiz.findById(id);
    } else {
      // Student view - exclude correct answers
      quiz = await Quiz.findById(id).select('-questions.correctAnswer -questions.explanation');
    }

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error getting quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new quiz (admin only)
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      passingScore = 28, // 70% of 40 questions
      timeLimit = 30,
      category = 'General',
      difficulty = 'medium'
    } = req.body;

    // Validate required fields
    if (!title || !description || !questions || questions.length !== 40) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and exactly 40 questions are required'
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !question.options || question.options.length !== 4 || 
          question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer > 3) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} is invalid. Each question must have a question text, exactly 4 options, and a valid correct answer index (0-3)`
        });
      }
    }

    const newQuiz = new Quiz({
      title,
      description,
      questions,
      passingScore,
      timeLimit,
      category,
      difficulty,
      createdBy: req.user._id
    });

    await newQuiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: newQuiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quiz (admin only)
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating results
    delete updateData.results;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: updatedQuiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete quiz (admin only)
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit quiz result (student)
export const submitQuizResult = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { studentId, studentName, studentEmail, answers, timeTaken } = req.body;

    // Validate required fields
    if (!studentId || !studentName || !studentEmail || !answers || answers.length !== 40) {
      return res.status(400).json({
        success: false,
        message: 'Student information and answers for all 40 questions are required'
      });
    }

    // Get quiz with correct answers
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!quiz.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This quiz is not active'
      });
    }

    // Calculate score
    let score = 0;
    const detailedAnswers = [];

    for (let i = 0; i < answers.length; i++) {
      const selectedAnswer = answers[i];
      const correctAnswer = quiz.questions[i].correctAnswer;
      const isCorrect = selectedAnswer === correctAnswer;
      
      if (isCorrect) score++; // Each correct answer = 1 mark

      detailedAnswers.push({
        questionIndex: i,
        selectedAnswer,
        isCorrect
      });
    }

    // Calculate percentage (score out of total questions)
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70; // 70% passing threshold

    // Create result object
    const result = {
      studentId,
      studentName,
      studentEmail,
      score: score, // Raw score (marks out of total questions)
      totalQuestions: totalQuestions,
      passed,
      answers: detailedAnswers,
      timeTaken,
      completedAt: new Date()
    };

    // Add result to quiz
    quiz.results.push(result);
    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score: score, // Raw score (marks out of total questions)
        totalQuestions: totalQuestions,
        percentage: percentage, // Percentage for display
        passed,
        passingScore: Math.round(totalQuestions * 0.7) // 70% of total questions
      }
    });
  } catch (error) {
    console.error('Error submitting quiz result:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quiz results (admin only)
export const getQuizResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;



    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Ensure results array exists
    const results = quiz.results || [];

    // Calculate pagination for results
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          title: quiz.title,
          totalAttempts: results.length,
          averageScore: results.length > 0 
            ? Math.round((results.reduce((sum, result) => sum + result.score, 0) / results.length) * 100) / 100
            : 0,
          passRate: results.length > 0
            ? Math.round((results.filter(result => result.passed).length / results.length) * 100)
            : 0
        },
        results: paginatedResults,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(results.length / parseInt(limit)),
          totalItems: results.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting quiz results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all quiz results across all quizzes (admin only) - for dashboard
export const getAllQuizResults = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Get all quizzes with results
    const quizzes = await Quiz.find({}).lean();
    
    // Collect all results from all quizzes
    let allResults = [];
    quizzes.forEach(quiz => {
      if (quiz.results && quiz.results.length > 0) {
        const quizResults = quiz.results.map(result => ({
          ...result,
          quizTitle: quiz.title,
          quizId: quiz._id,
          category: quiz.category,
          difficulty: quiz.difficulty
        }));
        allResults = allResults.concat(quizResults);
      }
    });

    // Sort by completion date (newest first)
    allResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = allResults.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginatedResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(allResults.length / parseInt(limit)),
        totalItems: allResults.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting all quiz results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quiz statistics (admin only)
export const getQuizStats = async (req, res) => {
  try {
    // Get all quizzes and calculate stats manually
    const quizzes = await Quiz.find({}).lean();
    
    const overview = {
      totalQuizzes: quizzes.length,
      activeQuizzes: quizzes.filter(q => q.isActive).length,
      inactiveQuizzes: quizzes.filter(q => !q.isActive).length,
      totalAttempts: quizzes.reduce((sum, quiz) => sum + (quiz.results ? quiz.results.length : 0), 0),
      totalPassed: quizzes.reduce((sum, quiz) => {
        if (!quiz.results) return sum;
        return sum + quiz.results.filter(result => result.passed).length;
      }, 0)
    };

    // Calculate category stats
    const categoryMap = {};
    quizzes.forEach(quiz => {
      if (!categoryMap[quiz.category]) {
        categoryMap[quiz.category] = { count: 0, attempts: 0 };
      }
      categoryMap[quiz.category].count++;
      categoryMap[quiz.category].attempts += quiz.results ? quiz.results.length : 0;
    });

    const categoryStats = Object.entries(categoryMap).map(([category, stats]) => ({
      _id: category,
      count: stats.count,
      attempts: stats.attempts
    })).sort((a, b) => b.count - a.count);

    // Calculate difficulty stats
    const difficultyMap = {};
    quizzes.forEach(quiz => {
      if (!difficultyMap[quiz.difficulty]) {
        difficultyMap[quiz.difficulty] = { count: 0, attempts: 0 };
      }
      difficultyMap[quiz.difficulty].count++;
      difficultyMap[quiz.difficulty].attempts += quiz.results ? quiz.results.length : 0;
    });

    const difficultyStats = Object.entries(difficultyMap).map(([difficulty, stats]) => ({
      _id: difficulty,
      count: stats.count,
      attempts: stats.attempts
    }));

    res.status(200).json({
      success: true,
      data: {
        overview,
        categoryStats,
        difficultyStats
      }
    });
  } catch (error) {
    console.error('Error getting quiz stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 