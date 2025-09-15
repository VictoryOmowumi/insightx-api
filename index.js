const express = require('express');
const http = require('http');
const { initSocket } = require('./utils/socket'); // Import initSocket from socket.js
const connectDB = require('./config/db');
const swaggerSetup = require('./swagger/swagger');
const cors = require('cors');
const passport = require('./config/passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = initSocket(server); // Initialize Socket.IO

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:5174',
  'http://localhost:4173',
  'https://insightx-ya2k.onrender.com',
  'https://insightx-ten.vercel.app',
  'https://insightx-agent.vercel.app/',	
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, server-to-server requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Disallow other origins
    return callback(new Error('Not allowed by CORS'));
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Configure express-session with MongoDB store for production
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
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

const PORT = process.env.PORT || 5000;

// Swagger
swaggerSetup(app);

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/activities', require('./routes/activityRoutes')); 
app.use('/api/forms', require('./routes/formRoutes')); 
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/requests', require('./routes/requestRoutes')); 
app.use('/api/dashboard', require('./routes/dashboardRoutes')); 
app.use('/api/settings', require('./routes/settingRoutes')); 
app.use('/api/notifications', require('./routes/notificationRoutes')); 
app.use('/api/roles', require('./routes/roleRoutes')); 
app.use('/api/regions', require('./routes/regionRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// For Render deployment - always listen in production
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export for Render deployment
module.exports = app;