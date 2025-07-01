import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";

// Add process error handlers to catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🚀 Starting PharmaCost Pro server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || '5000');

const app = express();
console.log('✓ Express app created');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
console.log('✓ Express middleware configured');

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

console.log('✓ Logging middleware added');

(async () => {
  try {
    const server = await registerRoutes(app);
    console.log('✓ API routes registered');

    // Serve static files in production
    const distPath = path.resolve(process.cwd(), "dist/public");
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      // Fall through to index.html for SPA routing
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
      console.log('✓ Static files served from', distPath);
    } else {
      // Fallback API-only mode
      app.get("*", (_req, res) => {
        res.json({ 
          status: "PharmaCost Pro API", 
          message: "Frontend build not available - API only mode",
          timestamp: new Date().toISOString()
        });
      });
      console.log('⚠️ Static files not found, running in API-only mode');
    }

    const port = parseInt(process.env.PORT || "5000");
    server.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🌐 Health check: http://localhost:${port}/api/health`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();