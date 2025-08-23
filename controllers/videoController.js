import fs from 'fs';
import path from 'path';

// Upload video for course
export const uploadCourseVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const { title, description, category, tags } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    // Create video record (stored as file path in course model)
    const videoData = {
      title,
      description,
      category,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: req.user?.email || 'Admin',
      status: 'active'
    };

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: videoData
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message
    });
  }
};

// Get all videos (admin only) - simplified to return file info
export const getAllVideos = async (req, res) => {
  try {
    const videosDir = 'uploads/videos';
    
    if (!fs.existsSync(videosDir)) {
      return res.status(200).json({
        success: true,
        data: [],
        total: 0
      });
    }

    const files = fs.readdirSync(videosDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.mkv'].includes(ext);
    });

    const videos = videoFiles.map(file => {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        originalName: file,
        filePath: filePath,
        fileSize: stats.size,
        mimeType: 'video/mp4',
        uploadedBy: 'Admin',
        status: 'active',
        createdAt: stats.birthtime,
        updatedAt: stats.mtime
      };
    });

    res.status(200).json({
      success: true,
      data: videos,
      total: videos.length
    });

  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting videos',
      error: error.message
    });
  }
};

// Get video by ID (filename)
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const videoPath = path.join('uploads/videos', id);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const stats = fs.statSync(videoPath);
    const video = {
      filename: id,
      originalName: id,
      filePath: videoPath,
      fileSize: stats.size,
      mimeType: 'video/mp4',
      uploadedBy: 'Admin',
      status: 'active',
      createdAt: stats.birthtime,
      updatedAt: stats.mtime
    };

    res.status(200).json({
      success: true,
      data: video
    });

  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting video',
      error: error.message
    });
  }
};

// Update video (admin only)
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, status } = req.body;
    const videoPath = path.join('uploads/videos', id);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // For now, just return success since we're not storing metadata separately
    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: {
        filename: id,
        title,
        description,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        status: status || 'active'
      }
    });

  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message
    });
  }
};

// Delete video (admin only)
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoPath = path.join('uploads/videos', id);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Delete the file
    fs.unlinkSync(videoPath);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message
    });
  }
};

// Get videos by category (simplified)
export const getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Since we don't have a database model, return all videos
    // In a real implementation, you'd filter by category
    const videosDir = 'uploads/videos';
    
    if (!fs.existsSync(videosDir)) {
      return res.status(200).json({
        success: true,
        data: [],
        total: 0
      });
    }

    const files = fs.readdirSync(videosDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.mkv'].includes(ext);
    });

    const videos = videoFiles.map(file => {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        originalName: file,
        filePath: filePath,
        fileSize: stats.size,
        mimeType: 'video/mp4',
        category: category, // Use the requested category
        uploadedBy: 'Admin',
        status: 'active',
        createdAt: stats.birthtime,
        updatedAt: stats.mtime
      };
    });

    res.status(200).json({
      success: true,
      data: videos,
      total: videos.length
    });

  } catch (error) {
    console.error('Error getting videos by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting videos by category',
      error: error.message
    });
  }
};

// Search videos (simplified)
export const searchVideos = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const videosDir = 'uploads/videos';
    
    if (!fs.existsSync(videosDir)) {
      return res.status(200).json({
        success: true,
        data: [],
        total: 0
      });
    }

    const files = fs.readdirSync(videosDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.mkv'].includes(ext);
    });

    // Filter by search query (filename contains query)
    const filteredVideos = videoFiles.filter(file => 
      file.toLowerCase().includes(q.toLowerCase())
    );

    const videos = filteredVideos.map(file => {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        originalName: file,
        filePath: filePath,
        fileSize: stats.size,
        mimeType: 'video/mp4',
        uploadedBy: 'Admin',
        status: 'active',
        createdAt: stats.birthtime,
        updatedAt: stats.mtime
      };
    });

    res.status(200).json({
      success: true,
      data: videos,
      total: videos.length
    });

  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching videos',
      error: error.message
    });
  }
};

// Get video statistics
export const getVideoStats = async (req, res) => {
  try {
    const videosDir = 'uploads/videos';
    
    if (!fs.existsSync(videosDir)) {
      return res.status(200).json({
        success: true,
        data: {
          totalVideos: 0,
          totalActive: 0,
          totalFileSize: 0
        }
      });
    }

    const files = fs.readdirSync(videosDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.mkv'].includes(ext);
    });

    let totalFileSize = 0;
    videoFiles.forEach(file => {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);
      totalFileSize += stats.size;
    });

    const stats = {
      totalVideos: videoFiles.length,
      totalActive: videoFiles.length,
      totalFileSize: totalFileSize
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting video stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting video stats',
      error: error.message
    });
  }
}; 