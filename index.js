const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const swaggerSetup = require('./swagger/swagger');
const cors = require('cors');
const backgroundService = require('./utils/backgroundService');
const passport = require('./config/passport');
const session = require('express-session'); // Add this line
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
const corsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
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
app.use('/api/auth', require('./routes/authRoutes')); // Auth routes
app.use('/api/activities', require('./routes/activityRoutes')); // Activity routes
app.use('/api/forms', require('./routes/formRoutes')); // Form routes
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/requests', require('./routes/requestRoutes')); // Request routes
app.use('/api/dashboard', require('./routes/dashboardRoutes')); // Dashboard routes
app.use('/api/settings', require('./routes/settingRoutes')); // Settings routes
app.use('/api/roles', require('./routes/roleRoutes')); // Role routes

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for activity updates
  socket.on('activityUpdate', (data) => {
    const { activityId, message } = data;
    io.emit('activityNotification', { activityId, message });
  });

  // Start background service
  backgroundService;

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));