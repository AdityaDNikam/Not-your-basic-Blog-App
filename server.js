import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', './views');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/basic-crud';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes

// Landing Page
app.get('/', (req, res) => {
  res.render('index');
});

// Create Account Page
app.get('/create-account', (req, res) => {
  res.render('create-account');
});

// Login Page (placeholder)
app.get('/login', (req, res) => {
  res.render('login');
});

// API Routes

// Create Profile - Create a new user
app.post('/create_profile', async (req, res) => {
  try {
    const { name, email, password, number } = req.body;

    // Validate required fields
    if (!name || !email || !password || !number) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if phone number already exists
    const existingNumber = await User.findOne({ number });
    if (existingNumber) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const newUser = new User({ name, email, password, number });
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'Profile created successfully', user: savedUser });
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
