import JWT from "jsonwebtoken";
import userModel from "../models/authModel.js";
import { verifyTokenPersistent } from "../helpers/tokenHelper.js";

//Protected Routes token base - Persistent version
export const requireSignIn = async (req, res, next) => {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header is required' 
      });
    }

    // Check if authorization header has the correct format
    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header must start with Bearer' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is required' 
      });
    }

    // Use persistent token verification
    const result = verifyTokenPersistent(token);
    
    if (!result.valid) {
      return res.status(401).json({ 
        success: false,
        message: result.error || 'Invalid token' 
      });
    }

    // Set user data from token (even if expired, we still allow access for persistent sessions)
    req.user = result.decoded;
    next();
  } catch (error) {
    console.log('JWT Error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }
};

//admin access
export const isAdmin = async (req, res, next) => {
  try {
    // Check if user exists in request
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not found in request",
      });
    }

    const user = await userModel.findById(req.user._id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== 1) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access - Admin privileges required",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error in admin middleware",
    });
  }
};