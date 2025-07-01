const express = require('express');
const path = require('path');

console.log('🚀 Starting PharmaCost Pro server...');

const app = express();
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic API routes with demo data
app.get('/api/vendors', (req, res) => {
  res.json([
    { id: 1, name: 'McKesson Connect' },
    { id: 3, name: 'Kinray' }
    // ... other vendors
  ]);
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});
