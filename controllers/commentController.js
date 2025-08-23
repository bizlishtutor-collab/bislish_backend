import Comment from '../models/commentModel.js';
import Blog from '../models/blogModel.js';

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { blogId, content, parentCommentId, author } = req.body;

    // Validate required fields
    if (!blogId || !content || !author) {
      return res.status(400).json({
        success: false,
        message: 'Blog ID, content, and author information are required'
      });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Create comment data
    const commentData = {
      blogId,
      content: content.trim(),
      author: {
        name: author.name,
        email: author.email,
        avatar: author.avatar || ''
      },
      isAdminComment: req.user?.role === 1 || false
    };

    // If this is a reply, set parent comment
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
      commentData.parentComment = parentCommentId;
    }

    // Create the comment
    const comment = new Comment(commentData);
    await comment.save();

    // If this is a reply, add it to parent comment's replies
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(
        parentCommentId,
        { $push: { replies: comment._id } }
      );
    }

    // Populate author info for response
    await comment.populate('author');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
};

// Get comments for a blog
const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 10, status = 'approved' } = req.query;

    // Validate blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const skip = (page - 1) * limit;

    // Get top-level comments (not replies)
    const comments = await Comment.find({
      blogId,
      parentComment: null,
      status: status
    })
    .populate('author')
    .populate({
      path: 'replies',
      match: { status: status },
      populate: { path: 'author' },
      options: { sort: { createdAt: 1 } }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Get total count
    const totalComments = await Comment.countDocuments({
      blogId,
      parentComment: null,
      status: status
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        hasNextPage: skip + comments.length < totalComments,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get blog comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// Get all comments (admin)
const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, blogId } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (blogId) {
      query.blogId = blogId;
    }

    const comments = await Comment.find(query)
      .populate('blogId', 'title slug')
      .populate('author')
      .populate('parentComment', 'content author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        hasNextPage: skip + comments.length < totalComments,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// Update comment status (admin)
const updateCommentStatus = async (req, res) => {
  try {
    const { commentId } = req.params;
    let { status } = req.body;

    // Clean and normalize the status value
    if (status) {
      status = status.toString().trim().toLowerCase();
    }

    // Check if status is valid
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { status },
      { new: true }
    ).populate('author');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      message: 'Comment status updated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Update comment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment status',
      error: error.message
    });
  }
};

// Delete comment (admin or comment author)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user can delete (admin or comment author)
    const isAdmin = req.user?.role === 1; // 1 for admin
    const isAuthor = comment.author.email === req.user?.email;

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment'
      });
    }

    // If this comment has replies, delete them first
    if (comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    // If this is a reply, remove it from parent comment's replies
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $pull: { replies: commentId } }
      );
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

// Toggle like on comment
const toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked the comment
    const existingLike = comment.likes.find(like => like.userEmail === userEmail);

    if (existingLike) {
      // Remove like
      comment.likes = comment.likes.filter(like => like.userEmail !== userEmail);
    } else {
      // Add like
      comment.likes.push({
        userEmail,
        likedAt: new Date()
      });
    }

    await comment.save();

    res.json({
      success: true,
      message: existingLike ? 'Like removed' : 'Comment liked',
      data: {
        liked: !existingLike,
        likeCount: comment.likes.length
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// Get comment statistics (admin)
const getCommentStats = async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments();
    const pendingComments = await Comment.countDocuments({ status: 'pending' });
    const approvedComments = await Comment.countDocuments({ status: 'approved' });
    const rejectedComments = await Comment.countDocuments({ status: 'rejected' });

    // Get recent comments
    const recentComments = await Comment.find()
      .populate('blogId', 'title')
      .populate('author')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalComments,
        pendingComments,
        approvedComments,
        rejectedComments,
        recentComments
      }
    });
  } catch (error) {
    console.error('Get comment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comment statistics',
      error: error.message
    });
  }
};

export {
  createComment,
  getBlogComments,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  toggleLike,
  getCommentStats
}; 