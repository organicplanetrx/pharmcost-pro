const express = require('express');

console.log('Starting PharmaCost Pro server...');

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  console.log('Health check request received');
  res.status(200).json({
    status: 'healthy',
    message: 'PharmaCost Pro API',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Basic API endpoints
app.get('/api/vendors', (req, res) => {
  const vendors = [
    { id: 1, name: 'McKesson Connect' },
    { id: 2, name: 'Cardinal Health' },
    { id: 3, name: 'Kinray' },
    { id: 4, name: 'AmerisourceBergen' },
    { id: 5, name: 'Morris & Dickson' }
  ];
  res.json(vendors);
});

app.post('/api/search', (req, res) => {
  const { searchTerm, vendorId } = req.body;
  console.log(`Search request: ${searchTerm} on vendor ${vendorId}`);
  
  const searchId = Math.floor(Math.random() * 10000);
  res.json({ searchId, status: 'started' });
});

app.get('/api/search/:id/results', (req, res) => {
  const results = [
    {
      id: 1,
      ndc: '12345-678-90',
      name: 'Sample Medication',
      cost: '$15.99',
      availability: 'In Stock',
      vendor: 'Demo Vendor'
    }
  ];
  res.json(results);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log('PharmaCost Pro ready for requests');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});