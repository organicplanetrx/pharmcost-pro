const express = require('express');
const path = require('path');

console.log('🚀 Starting PharmaCost Pro server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static('dist'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Basic API routes
app.get('/api/vendors', (req, res) => {
  res.json([
    { id: 1, name: 'McKesson Connect', url: 'https://connect.mckesson.com' },
    { id: 2, name: 'Cardinal Health', url: 'https://www.cardinalhealth.com' },
    { id: 3, name: 'Kinray', url: 'https://kinray.com' },
    { id: 4, name: 'AmerisourceBergen', url: 'https://www.amerisourcebergen.com' },
    { id: 5, name: 'Morris & Dickson', url: 'https://www.morrisanddickson.com' }
  ]);
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalSearchesToday: 0,
    totalCostAnalysis: '$0.00',
    csvExportsGenerated: 0
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🌐 Visit: http://localhost:${port}`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});