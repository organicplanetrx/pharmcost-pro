// Simple health check server to test Railway deployment
const express = require('express');
const app = express();

console.log('Health check server starting...');

app.get('/', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Health server running on port ${port}`);
});