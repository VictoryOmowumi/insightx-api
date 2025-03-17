const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const { sendNotification } = require('../utils/appNotification');
const ldap = require('ldapjs');

// LDAP server configuration
const ldapConfig = {
  url: 'ldap://10.10.15.50:389', 
  baseDN: 'DC=sevenup,DC=org', 
};


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
      role: role || 'Member', 
      password: hashedPassword,
    });

    await user.save();

    // Send notification to admin about the new user and also to the user
    const admins = await User.find({ role: 'Admin' });
    admins.forEach(admin => {
      sendNotification(admin.id, 'newMember', `New user ${name} has registered`);
    });
    sendNotification(user.id, 'newRequest', 'Your registration request has been received');

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





// @desc    LDAP login (replaces traditional login)
// @route   POST /api/auth/login
// @access  Public
exports.traditionalLogin = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const username = emailOrUsername.includes('@')
      ? emailOrUsername.split('@')[0] 
      : emailOrUsername; 

    const userDN = `CN=${username},OU=Users,${ldapConfig.baseDN}`;

    const client = ldap.createClient({
      url: ldapConfig.url,
      timeout: 10000, // 10 seconds
    });

    // Perform an anonymous bind to check if the server is reachable
    client.bind('', '', (err) => {
      if (err) {
        console.error('LDAP anonymous bind failed:', err);
        return res.status(500).json({ message: 'LDAP server not reachable' });
      }

      // Perform the actual bind with credentials
      client.bind(userDN, password, async (err) => {
        if (err) {
          console.error('LDAP bind failed:', err);
          // await LoginHistory.create({ userId: undefined, status: 'failed' });
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the user exists in the local database
        let user = await User.findOne({ email: emailOrUsername });
        if (!user) {
          user = new User({
            email: emailOrUsername, 
            name: username, 
            role: 'Member', 
            password: undefined,
          });
          await user.save();
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

        // Log the login history
        // await LoginHistory.create({ userId: user._id, status: 'success' });

        // Send notification on successful login
        // await sendNotification(user._id, 'login', `User ${user.name} logged in successfully`);

        // Return the token
        res.json({ token });
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc    Update user details (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private (Admin only)
exports.updateUserDetails = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User details updated successfully', user });
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

      // Retrieve the stored redirect path
      const redirectPath = req.query.state || '/'; // Use state parameter for OAuth redirects

      // Redirect to the stored path or the frontend with token
      res.redirect(`http://localhost:5173${redirectPath}?token=${token}`);
    } catch (err) {
      return next(err);
    }
  })(req, res, next);
};



