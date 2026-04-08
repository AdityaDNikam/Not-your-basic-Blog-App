import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from './models/User.js';
import Blog from './models/Blog.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// AUTH MIDDLEWARE - Verify JWT and decrypt email from cookie
export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized login required' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findOne({ email: decoded.email });
    
    if (!user) {
      return res.status(401).clearCookie('authToken').clearCookie('userEmail').json({ message: 'User not found' });
    }

    req.user = decoded;
    req.userDb = user;
    next();
  } catch (error) {
    res.status(401).clearCookie('authToken').clearCookie('userEmail').json({ message: 'Session expired' });
  }
};

// USER OWNERSHIP MIDDLEWARE - Verify that the userId in params matches the authenticated user
export const verifyUserOwnership = (req, res, next) => {
  try {
    // support both :id and :userId route parameters
    const targetId = req.params.id || req.params.userId; 
    const authenticatedUserId = req.user.userId || req.userDb._id.toString();
    
    if (targetId !== authenticatedUserId && targetId !== req.userDb._id.toString()) {
      return res.status(403).json({ message: 'Task unauthorised' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// BLOG OWNERSHIP MIDDLEWARE - Verify that the blog being accessed/updated matches the authenticated user
// Checks if the blog's userId matches the authenticated user's userId in the database
export const verifyBlogOwnership = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const authenticatedUserId = req.user.userId || req.userDb._id.toString();
    const blogOwnerId = blog.user_id.toString();
    
    if (blogOwnerId !== authenticatedUserId && blogOwnerId !== req.userDb._id.toString()) {
      return res.status(403).json({ message: 'Task unauthorised' });
    }
    
    // Attach blog to request for use in route handler
    req.blog = blog;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
