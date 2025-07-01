// Ultra-minimal test server for Railway debugging
console.log('Starting minimal test server...');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);

const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.method, req.url);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Railway deployment working!'
  }));
});

const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
  console.log('Server ready to accept connections');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Keep the process alive
setInterval(() => {
  console.log('Server still running...');
}, 30000);