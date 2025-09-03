const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' 
        ? 'https://insightx.onrender.com/api/auth/google/callback'
        : 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create a new user if they don't exist
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            role: 'Member', // Default role
            profilePic: profile.photos[0].value,
            googleProfile: profile, // Store the entire Google profile
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
          });
          await user.save();
          await LoginHistory.create({ userId: user.id, status: 'success' });
        } else {
          user.googleProfile = profile;
          user.googleAccessToken = accessToken;
          user.googleRefreshToken = refreshToken;
          await user.save();
          await LoginHistory.create({ userId: user.id, status: 'success' });
        }

        // Return the user object
        done(null, user);
      } catch (err) {
        await LoginHistory.create({ userId: null, status: 'failed' });
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;