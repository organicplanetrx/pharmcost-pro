const http = require('http');
const url = require('url');

console.log('Starting HTTP server for Railway...');

// Create basic HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  console.log(`${new Date().toISOString()} - ${req.method} ${path}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  let response;
  
  if (path === '/' || path === '/health' || path === '/api/health') {
    response = {
      status: 'ok',
      message: 'PharmaCost Pro API',
      timestamp: new Date().toISOString(),
      path: path
    };
  } else {
    response = {
      status: 'not_found',
      message: 'Endpoint not found',
      available: ['/', '/health', '/api/health']
    };
  }
  
  res.writeHead(200);
  res.end(JSON.stringify(response));
});

const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
  console.log(`HTTP server running on 0.0.0.0:${port}`);
  console.log('Ready to handle requests');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Keep alive
setInterval(() => {
  console.log('Server heartbeat');
}, 60000);