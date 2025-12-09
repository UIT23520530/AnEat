const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'AnEat Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to AnEat API',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.server.env === 'development' && { stack: err.stack })
  });
});

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${config.server.env}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
