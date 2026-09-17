const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pgService = require('../services/pgService');
const User = require('../models/User');
const router = express.Router();

const isPg = () => process.env.DB_TYPE !== 'mongo';

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    let user;
    if (isPg()) {
      user = await pgService.findUserByEmail(email);
    } else {
      user = await User.findOne({ email }).select('+password');
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id || user._id, role: user.role },
      process.env.JWT_SECRET || 'secret-jwt-key-restaurant-system-production-ready',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: (user.id || user._id).toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin signup (for initial setup)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    let existingUser;
    if (isPg()) {
      existingUser = await pgService.findUserByEmail(email);
    } else {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    }

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email. Please login instead.' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    let createdUser;
    if (isPg()) {
      createdUser = await pgService.createUser({ name, email, password: hashedPassword, role });
    } else {
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role
      });
      await user.save();
      createdUser = { id: user._id, name: user.name, email: user.email, role: user.role };
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: createdUser.id, role: createdUser.role },
      process.env.JWT_SECRET || 'secret-jwt-key-restaurant-system-production-ready',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: createdUser.id.toString(),
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-jwt-key-restaurant-system-production-ready');
    
    let user;
    if (isPg()) {
      user = await pgService.findUserById(decoded.userId);
    } else {
      user = await User.findById(decoded.userId).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.json({
      user: {
        id: (user.id || user._id).toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;