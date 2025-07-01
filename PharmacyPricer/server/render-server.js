const express = require('express');
const path = require('path');

console.log('Starting PharmaCost Pro for Render...');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Health check endpoints
app.get('/', (req, res) => {
  console.log('Root request received');
  res.status(200).json({
    status: 'healthy',
    message: 'PharmaCost Pro API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  console.log('Health check request');
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API Routes for the pharmacy app
app.get('/api/vendors', async (req, res) => {
  try {
    // Demo vendors for now
    const vendors = [
      { id: 1, name: 'McKesson Connect', url: 'https://connect.mckesson.com' },
      { id: 2, name: 'Cardinal Health', url: 'https://cardinalhealth.com' },
      { id: 3, name: 'Kinray', url: 'https://kinray.com' },
      { id: 4, name: 'AmerisourceBergen', url: 'https://amerisourcebergen.com' },
      { id: 5, name: 'Morris & Dickson', url: 'https://morrisdickson.com' }
    ];
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.post('/api/test-connection', async (req, res) => {
  try {
    const { vendorId, username, password } = req.body;
    console.log(`Testing connection for vendor ${vendorId}`);
    
    // Simulate connection test
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Connection successful'
      });
    }, 1000);
    
  } catch (error) {
    console.error('Connection test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Connection test failed' 
    });
  }
});

app.post('/api/search', async (req, res) => {
  try {
    const { vendorId, searchTerm, searchType } = req.body;
    console.log(`Search request: ${searchTerm} (${searchType}) on vendor ${vendorId}`);
    
    // Generate demo search ID
    const searchId = Math.floor(Math.random() * 10000);
    
    res.json({
      searchId: searchId,
      status: 'started'
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/search/:id/results', async (req, res) => {
  try {
    const searchId = req.params.id;
    console.log(`Fetching results for search ${searchId}`);
    
    // Demo results
    const results = [
      {
        id: 1,
        ndc: '12345-678-90',
        name: 'Sample Medication',
        genericName: 'sample-generic',
        strength: '10mg',
        cost: '$15.99',
        availability: 'In Stock',
        vendor: 'Demo Vendor'
      }
    ];
    
    res.json(results);
    
  } catch (error) {
    console.error('Results fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const stats = {
      totalSearchesToday: 5,
      totalCostAnalysis: '$2,345.67',
      csvExportsGenerated: 3
    };
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`✓ PharmaCost Pro running on port ${port}`);
  console.log(`✓ Health check: http://localhost:${port}/health`);
  console.log('✓ Ready for Render deployment');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});