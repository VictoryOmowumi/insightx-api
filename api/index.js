const express = require('express');
const serverless = require('serverless-http');
const connectDB = require('../config/db');
const swaggerSetup = require('../swagger/swagger');
const cors = require('cors');
const passport = require('../config/passport');
const session = require('cookie-session');
const MongoStore = require('connect-mongo'); // Use connect-mongo for session store
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

// Configure express-session with MongoStore
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = serverless(app); // Export the wrapped app