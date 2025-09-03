const express = require('express');
const serverless = require('serverless-http');
const connectDB = require('../config/db');
const swaggerSetup = require('../swagger/swagger');
const cors = require('cors');
const passport = require('../config/passport');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Correct import
require('dotenv').config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'https://insightx-agent-65kh.vercel.app',
  'https://insightx-agent.netlify.app',
  'https://insightx-agent-65kh.vercel.app/login',
  'https://insightx-webb-bhh50o2rm-victoryomowumis-projects.vercel.app',
  'https://insightx-webb-iauecig7f-victoryomowumis-projects.vercel.app',
  'https://insightx-webb-jfgl7qoxd-victoryomowumis-projects.vercel.app',
  'https://insightx-webb-fgnx7bxz6-victoryomowumis-projects.vercel.app',
  'https://insightx-webb-1zsxcav52-victoryomowumis-projects.vercel.app',
  'https://insightx-webb-l4uorkezl-victoryomowumis-projects.vercel.app',
  'https://insightx-webb.vercel.app',
  'https://insightx-1ixfenb9u-victoryomowumis-projects.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Configure express-session with MongoStore for production
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 24 hours
    }),
    cookie: { 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Swagger
swaggerSetup(app);

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/activities', require('../routes/activityRoutes'));
app.use('/api/forms', require('../routes/formRoutes'));
app.use('/api/agents', require('../routes/agentRoutes'));
app.use('/api/requests', require('../routes/requestRoutes'));
app.use('/api/dashboard', require('../routes/dashboardRoutes'));
app.use('/api/settings', require('../routes/settingRoutes'));
app.use('/api/notifications', require('../routes/notificationRoutes'));
app.use('/api/roles', require('../routes/roleRoutes'));
app.use('/api/regions', require('../routes/regionRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = serverless(app); // Export the wrapped app