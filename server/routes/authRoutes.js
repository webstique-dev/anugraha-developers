const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protectAdmin } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'anugraha_admin_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

/**
 * @route   GET /api/auth/health
 * @desc    Health check for auth service
 * @access  Public
 */
router.get('/health', (req, res) => {
  return res.json({
    success: true,
    message: 'Auth service is operational'
  });
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new Admin account in MongoDB (password salted & hashed via bcryptjs)
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (Name, Email, Password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'An Admin account with this email already exists' });
    }

    // Create new Admin in MongoDB (bcryptjs pre-save hook handles salt & hashing)
    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password
    });

    const token = generateToken(admin._id);

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('SERVER ERROR in /api/auth/register:', error.stack || error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating admin account',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate existing Admin & return JWT token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin email or password' });
    }

    // Compare bcryptjs salted hash
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin email or password' });
    }

    const token = generateToken(admin._id);

    return res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('SERVER ERROR in /api/auth/login:', error.stack || error);
    return res.status(500).json({
      success: false,
      message: 'Server error logging in',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated Admin profile
 * @access  Private (Admin)
 */
router.get('/me', protectAdmin, async (req, res, next) => {
  try {
    return res.json({
      success: true,
      user: req.admin
    });
  } catch (error) {
    console.error('SERVER ERROR in /api/auth/me:', error.stack || error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

module.exports = router;
