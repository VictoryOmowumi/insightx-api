// Error handling middleware
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  };
  
  // Use it in your app
  app.use(exports.errorHandler);