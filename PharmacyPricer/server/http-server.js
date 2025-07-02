const http = require('http');
const url = require('url');

console.log('Starting HTTP server for Railway...');

// Create basic HTTP server
const server = http.createServer((req, res) => {
  const startTime = Date.now();
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  console.log(`${new Date().toISOString()} - ${req.method} ${path} from ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Set timeout for request
  req.setTimeout(30000, () => {
    console.log('Request timeout');
    if (!res.headersSent) {
      res.writeHead(408);
      res.end('Request timeout');
    }
  });
  
  res.setTimeout(30000, () => {
    console.log('Response timeout');
    if (!res.headersSent) {
      res.writeHead(504);
      res.end('Response timeout');
    }
  });
  
  try {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.writeHead(200);
      res.end();
      console.log(`OPTIONS request handled in ${Date.now() - startTime}ms`);
      return;
    }
    
    // Set response headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Server', 'Railway-HTTP');
    
    let response;
    let statusCode = 200;
    
    if (path === '/' || path === '/health' || path === '/api/health') {
      response = {
        status: 'healthy',
        message: 'PharmaCost Pro API',
        timestamp: new Date().toISOString(),
        path: path,
        method: req.method,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: {
          port: process.env.PORT,
          node_env: process.env.NODE_ENV
        }
      };
    } else {
      statusCode = 404;
      response = {
        status: 'not_found',
        message: 'Endpoint not found',
        path: path,
        available: ['/', '/health', '/api/health']
      };
    }
    
    const responseData = JSON.stringify(response, null, 2);
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(responseData)
    });
    res.end(responseData);
    
    console.log(`${req.method} ${path} -> ${statusCode} (${Date.now() - startTime}ms)`);
    
  } catch (error) {
    console.error('Request processing error:', error);
    if (!res.headersSent) {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      }));
    }
  }
});

const port = process.env.PORT || 3000;

// Configure server settings for Railway
server.keepAliveTimeout = 65000;  // Must be higher than Railway's timeout
server.headersTimeout = 66000;   // Must be higher than keepAliveTimeout
server.requestTimeout = 30000;
server.timeout = 30000;

server.listen(port, '0.0.0.0', () => {
  console.log(`✓ HTTP server running on 0.0.0.0:${port}`);
  console.log(`✓ Process ID: ${process.pid}`);
  console.log(`✓ Node version: ${process.version}`);
  console.log('✓ Ready to handle requests from Railway');
  
  // Test internal connectivity
  setTimeout(() => {
    const testReq = http.request({
      hostname: '127.0.0.1',  // Use IPv4 explicitly
      port: port,
      path: '/health',
      method: 'GET'
    }, (res) => {
      console.log(`✓ Internal health check: ${res.statusCode}`);
    });
    testReq.on('error', (err) => {
      console.error('✗ Internal health check failed:', err.message);
    });
    testReq.end();
  }, 1000);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  }
  process.exit(1);
});

server.on('connection', (socket) => {
  console.log('New connection from:', socket.remoteAddress);
  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
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