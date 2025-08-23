import Review from '../models/reviewModel.js';

// Get all reviews (admin only)
export const getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reviews with pagination
    const reviews = await Review.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Review.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get public reviews (for frontend display)
export const getPublicReviews = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const filter = { status: 'active' };

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error getting public reviews:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new review (admin only)
export const createReview = async (req, res) => {
  try {
    const { name, image, review } = req.body;

    // Validate required fields
    if (!name || !review) {
      return res.status(400).json({
        success: false,
        message: 'Name and review are required'
      });
    }

    const newReview = new Review({
      name,
      image,
      review,
      status: 'active'
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get review by ID
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error getting review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update review (admin only)
export const updateReview = async (req, res) => {
  try {
    const { name, image, review, status } = req.body;
    const { id } = req.params;

    const updateData = {};
    if (name) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (review) updateData.review = review;
    if (status) updateData.status = status;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete review (admin only)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload review image (admin only)
export const uploadReviewImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Return relative path - frontend will construct full URL
    const imagePath = `/uploads/images/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: imagePath
      }
    });
  } catch (error) {
    console.error('Error uploading review image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get review statistics (admin only)
export const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          activeReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalReviews: 0,
          activeReviews: 0,
          inactiveReviews: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting review stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 