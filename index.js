const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Marketing Application API',
      version: '1.0.0',
      description: 'API for managing marketing activities, dashboards, forms, stock requests, roles, etc.',
    },
    tags: [
      {
        name: 'Auth',
        description: 'User authentication and registration',
      },
      {
        name: 'Activities',
        description: 'Manage marketing activities',
      },
      {
        name: 'Forms',
        description: 'Manage forms for marketing activities',
      },
      {
        name: 'Agents',
        description: 'Agent authentication and form management',
      },
      {
        name: 'Stock Requests',
        description: 'Manage stock requests',
      },
      {
        name: 'Dashboard',
        description: 'Fetch dashboard metrics and insights',
      },
      {
        name: 'Settings',
        description: 'Manage roles and system settings',
      },
      {
        name: 'Roles',
        description: 'Manage user roles and permissions',
      }
    ],
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes')); // Auth routes
app.use('/api/activities', require('./routes/activityRoutes')); // Activity routes
app.use('/api/forms', require('./routes/formRoutes')); // Form routes
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/requests', require('./routes/requestRoutes')); // Request routes
app.use('/api/dashboard', require('./routes/dashboardRoutes')); // Dashboard routes
app.use('/api/settings', require('./routes/settingsRoutes')); // Settings routes
app.use('/api/roles', require('./routes/roleRoutes')); // Role routes

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for activity updates
  socket.on('activityUpdate', (data) => {
    const { activityId, message } = data;

    // Broadcast the update to all clients
    io.emit('activityNotification', { activityId, message });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start Server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));