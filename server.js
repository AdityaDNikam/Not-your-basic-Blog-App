import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import Blog from './models/Blog.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', './views');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/basic-crud';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// AUTH MIDDLEWARE - Verify JWT and decrypt email from cookie
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    const encryptedEmail = req.cookies.userEmail;

    if (!token || !encryptedEmail) {
      return res.redirect('/login');
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Decrypt email using bcryptjs (simple decryption by comparing)
    // For this implementation, we'll verify email exists in DB
    const user = await User.findOne({ email: decoded.email });
    
    if (!user) {
      return res.clearCookie('authToken').clearCookie('userEmail').redirect('/login');
    }

    // Decrypt email by comparing with hashed version
    const emailMatchesHash = await bcryptjs.compare(user.email, encryptedEmail);
    
    if (!emailMatchesHash) {
      return res.clearCookie('authToken').clearCookie('userEmail').redirect('/login');
    }

    req.user = decoded;
    req.userDb = user;
    next();
  } catch (error) {
    res.clearCookie('authToken').clearCookie('userEmail').redirect('/login');
  }
};

// Routes

// Landing Page
app.get('/', (req, res) => {
  res.render('index');
});

// Create Account Page
app.get('/create-account', (req, res) => {
  res.render('create-account');
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

// API Routes

// Create Profile - Create a new user with authentication
app.post('/create_profile', async (req, res) => {
  try {
    const { name, username, email, password, number } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password || !number) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Check if phone number already exists
    const existingNumber = await User.findOne({ number });
    if (existingNumber) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Create new user (password will be hashed by pre-save hook)
    const newUser = new User({ name, username, email, password, number });
    const savedUser = await newUser.save();

    // Create JWT with username, email, and userId
    const token = jwt.sign(
      { username: savedUser.username, email: savedUser.email, userId: savedUser._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Encrypt email for cookie using bcryptjs
    const encryptedEmail = await bcryptjs.hash(email, 10);

    // Set cookies
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('userEmail', encryptedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Profile created successfully',
      user: savedUser,
      redirect: `/${savedUser.username}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login User - Accept email and password
app.post('/login_user', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT
    const token = jwt.sign(
      { username: user.username, email: user.email, userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Encrypt email for cookie
    const encryptedEmail = await bcryptjs.hash(user.email, 10);

    // Set cookies
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('userEmail', encryptedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      redirect: `/${user.username}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected Route - User Dashboard
app.get('/:username', verifyAuth, async (req, res) => {
  try {
    const { username } = req.params;

    // Verify that the username in URL matches the JWT
    if (username !== req.user.username) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user from database (already fetched in middleware)
    const user = req.userDb;

    // Fetch user's blogs
    const blogs = await Blog.find({ user_id: user._id }).sort({ createdAt: -1 });

    res.render('dashboard', { user, blogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.clearCookie('userEmail');
  res.redirect('/');
});

// BLOG ROUTES

// Create a new blog - Protected route (requires authentication)
app.post('/api/blogs', verifyAuth, async (req, res) => {
  try {
    const { Blog_header, Blog_msg, related_url } = req.body;
    const user_id = req.user.userId || req.userDb._id;

    // Validate required fields
    if (!Blog_header || !Blog_msg) {
      return res.status(400).json({ message: 'Blog header and message are required' });
    }

    const newBlog = new Blog({
      Blog_header,
      Blog_msg,
      related_url: related_url || null,
      user_id,
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({ message: 'Blog created successfully', blog: savedBlog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all blogs for a specific user
app.get('/api/blogs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const blogs = await Blog.find({ user_id: userId }).populate('user_id', 'username email name');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single blog by ID
app.get('/api/blogs/post/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId).populate('user_id', 'username email name');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a blog - Protected route
app.put('/api/blogs/:blogId', verifyAuth, async (req, res) => {
  try {
    const { blogId } = req.params;
    const { Blog_header, Blog_msg, related_url } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is the blog owner
    if (blog.user_id.toString() !== req.user.userId && blog.user_id.toString() !== req.userDb._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        Blog_header: Blog_header || blog.Blog_header,
        Blog_msg: Blog_msg || blog.Blog_msg,
        related_url: related_url !== undefined ? related_url : blog.related_url,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a blog - Protected route
app.delete('/api/blogs/:blogId', verifyAuth, async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is the blog owner
    if (blog.user_id.toString() !== req.user.userId && blog.user_id.toString() !== req.userDb._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Blog.findByIdAndDelete(blogId);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, password, number } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password, number },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
