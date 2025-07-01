// Test Express.js on Railway
console.log('Starting Express test server...');

const express = require('express');
const app = express();

console.log('Express imported successfully');

// Middleware
app.use(express.json());
console.log('JSON middleware added');

// Routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'Express working on Railway!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/vendors', (req, res) => {
  res.json([
    { id: 1, name: 'McKesson Connect', url: 'https://connect.mckesson.com' },
    { id: 2, name: 'Cardinal Health', url: 'https://www.cardinalhealth.com' },
    { id: 3, name: 'Kinray', url: 'https://kinray.com' }
  ]);
});

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Express server running on port ${port}`);
  console.log('Ready for requests!');
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});