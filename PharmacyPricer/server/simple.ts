import express from "express";

console.log('🚀 Starting simple server...');
const app = express();

app.use(express.json());

// Immediate response endpoints
app.get("/", (req, res) => {
  console.log('Root request received');
  res.json({ 
    status: "PharmaCost Pro API",
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  console.log('Health check request');
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/vendors", (req, res) => {
  console.log('Vendors request');
  res.json([
    { id: 1, name: "McKesson Connect", url: "https://connect.mckesson.com" },
    { id: 3, name: "Kinray", url: "https://kinray.com" }
  ]);
});

const port = parseInt(process.env.PORT || "5000");

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Simple server running on 0.0.0.0:${port}`);
  console.log(`🌐 Try: https://pharmcost-pro-production.up.railway.app/`);
});

// Keep alive
setInterval(() => {
  console.log('Server heartbeat:', new Date().toISOString());
}, 30000);