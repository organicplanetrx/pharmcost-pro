const express = require('express');

const app = express();

// Enable all CORS and logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.json({
    status: 'PharmaCost Pro API',
    message: 'Railway deployment successful',
    timestamp: new Date().toISOString(),
    port: process.env.PORT,
    node_env: process.env.NODE_ENV
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  console.log('API health check endpoint hit');
  res.json({ status: 'ok', service: 'pharmcost-pro' });
});

// Handle all other routes
app.get('*', (req, res) => {
  console.log('Catch-all endpoint hit:', req.url);
  res.json({
    message: 'PharmaCost Pro API',
    requested_path: req.url,
    available_endpoints: ['/', '/health', '/api/health']
  });
});

// Get port from environment or use 3000
const port = process.env.PORT || 3000;

console.log('Starting server...');
console.log('Port:', port);
console.log('NODE_ENV:', process.env.NODE_ENV);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${port}`);
  console.log('Server is ready to receive requests');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Keep alive heartbeat
setInterval(() => {
  console.log('Server heartbeat - still running');
}, 30000);