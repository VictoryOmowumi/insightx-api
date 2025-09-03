// Swagger Configuration
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 8080;

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
        },
        {
          name: 'Regions',
          description: 'Manage regions and territories',
        }
      ],
      servers: [
        {
          url: 'https://insightx-1ixfenb9u-victoryomowumis-projects.vercel.app',
          description: 'Production Server',
        },
        {
          url: 'http://localhost:5000',
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
module.exports = (app) => {
  // Serve Swagger JSON
  app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
  });

  // Simple Swagger UI setup for Vercel
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "InsightX API Documentation",
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
    },
  }));
};