import Notes from '../models/notesModel.js';
import User from '../models/authModel.js';

// Create new notes
export const createNotes = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      category,
      difficulty,
      tags,
      isPublic,
      status
    } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload a file' 
      });
    }

    // Create notes object
    const notesData = {
      title,
      description,
      subject,
      category,
      difficulty,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic === 'true',
      status,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      createdBy: req.user._id
    };

    const notes = new Notes(notesData);
    await notes.save();

    res.status(201).json({
      success: true,
      message: 'Notes uploaded successfully',
      data: notes
    });
  } catch (error) {
    console.error('Create notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating notes', 
      error: error.message 
    });
  }
};

// Get all notes (admin)
export const getAllNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, difficulty, status } = req.query;

    const query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notes = await Notes.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notes.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notes', 
      error: error.message 
    });
  }
};

// Get public notes (for frontend)
export const getPublicNotes = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category, difficulty } = req.query;

    const query = { 
      isPublic: true, 
      status: 'active' 
    };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notes = await Notes.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notes.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get public notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notes', 
      error: error.message 
    });
  }
};

// Get single notes by ID
export const getNotesById = async (req, res) => {
  try {
    const { id } = req.params;

    const notes = await Notes.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!notes) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notes not found' 
      });
    }

    // Increment views for public notes
    if (notes.isPublic && notes.status === 'active') {
      await Notes.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Get notes by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notes', 
      error: error.message 
    });
  }
};

// Update notes
export const updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle tags array
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    // Handle boolean fields
    if (updateData.isPublic !== undefined) {
      updateData.isPublic = updateData.isPublic === 'true';
    }

    // If new file is uploaded
    if (req.file) {
      updateData.fileUrl = req.file.path;
      updateData.fileName = req.file.originalname;
      updateData.fileSize = req.file.size;
      updateData.fileType = req.file.mimetype;
    }

    const notes = await Notes.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!notes) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notes not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notes updated successfully',
      data: notes
    });
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating notes', 
      error: error.message 
    });
  }
};

// Delete notes
export const deleteNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const notes = await Notes.findByIdAndDelete(id);

    if (!notes) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notes not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notes deleted successfully'
    });
  } catch (error) {
    console.error('Delete notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting notes', 
      error: error.message 
    });
  }
};

// Download notes (increment download count)
export const downloadNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const notes = await Notes.findById(id);

    if (!notes) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notes not found' 
      });
    }

    // Increment download count
    await Notes.findByIdAndUpdate(id, { $inc: { downloads: 1 } });

    res.status(200).json({
      success: true,
      message: 'Download count updated',
      data: {
        fileUrl: notes.fileUrl,
        fileName: notes.fileName
      }
    });
  } catch (error) {
    console.error('Download notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing download', 
      error: error.message 
    });
  }
};

// Get notes statistics
export const getNotesStats = async (req, res) => {
  try {
    const totalNotes = await Notes.countDocuments();
    const publicNotes = await Notes.countDocuments({ isPublic: true, status: 'active' });
    const totalDownloads = await Notes.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const totalViews = await Notes.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const categoryStats = await Notes.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const difficultyStats = await Notes.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalNotes,
        publicNotes,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0,
        categoryStats,
        difficultyStats
      }
    });
  } catch (error) {
    console.error('Get notes stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notes statistics', 
      error: error.message 
    });
  }
}; 