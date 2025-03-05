const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
// @desc    Get all users
// @route   GET /api/auth/users
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Register a new user (Admin only)
// @route   POST /api/auth/register
// @access  Private (Admin only)
exports.registerUser = async (req, res) => {
  try {
    const { email, name, role, password } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password (if provided)
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Create a new user
    user = new User({
      email,
      name,
      role: role || 'Member', // Default role is 'Member'
      password: hashedPassword, // Optional: Only if using password-based login
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Traditional email/password login
// @route   POST /api/auth/login
// @access  Public
exports.traditionalLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      await LoginHistory.create({ userId: null, status: 'failed' });
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the user has a password (for users registered via traditional login)
    if (!user.password) {
      return res.status(400).json({ message: 'Please log in using Google OAuth' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await LoginHistory.create({ userId: user.id, status: 'failed' });
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Update lastLogin field
    user.lastLogin = new Date();
    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePic: user.profilePic,
      },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );
    await LoginHistory.create({ userId: user.id, status: 'success' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Disable or enable a user (Admin only)
// @route   PUT /api/auth/users/:id/status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User status updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false, failureRedirect: '/login' }, async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Google authentication failed' });
    }

    try {
      // Update lastLogin field
      user.lastLogin = new Date();
      await user.save();

      // Generate a JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profilePic: user.profilePic,
          googleProfile: user.googleProfile,
          accessToken: user.googleAccessToken,
          refreshToken: user.googleRefreshToken,
        },
        process.env.JWT_SECRET,
        { expiresIn: '6h' }
      );

      // Redirect or return the token
      res.redirect(`http://localhost:5173?token=${token}`); // Redirect to frontend with token
    } catch (err) {
      return next(err);
    }
  })(req, res, next);
};





