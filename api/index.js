const express = require('express');
const serverless = require('serverless-http');
const http = require('http');
const { initSocket } = require('../utils/socket'); 
const connectDB = require('../config/db');
const swaggerSetup = require('../swagger/swagger');
const cors = require('cors');
const passport = require('../config/passport');
const session = require('express-session');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = initSocket(server); // Initialize Socket.IO

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

// Configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = serverless({ app, io }); 