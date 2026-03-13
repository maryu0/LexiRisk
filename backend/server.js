require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const analyseRoutes = require("./routes/analyse");
const reportRoutes = require("./routes/report");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS not allowed"), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LexiRisk backend server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: {
      server: "online",
      mlService: process.env.ML_SERVICE_URL || "not configured",
    },
  });
});

// API Routes
app.use("/api/analyse", analyseRoutes);
app.use("/api/report", reportRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log("========================================");
  console.log("   LexiRisk Backend Server Started");
  console.log("========================================");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Server running on port: ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  const mlUrl =
    process.env.ML_SERVICE_URL || "http://localhost:8000/api/classify";
  console.log(`ML Service: ${mlUrl}`);
  console.log("========================================");

  // Ping ML service health on startup so we know immediately if it's reachable
  const mlHealthUrl = mlUrl.replace(/\/api\/classify.*$/, "/api/health");
  console.log(`[STARTUP] Checking ML service at ${mlHealthUrl} ...`);
  http
    .get(mlHealthUrl, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode === 200 && json.models_loaded) {
            console.log(
              `[STARTUP] ✓ ML service is ONLINE — models loaded (${json.version || ""})`,
            );
          } else {
            console.warn(
              `[STARTUP] ⚠ ML service responded but models NOT loaded: ${body}`,
            );
          }
        } catch {
          console.warn(
            `[STARTUP] ⚠ ML service health check returned unexpected response: ${body}`,
          );
        }
      });
    })
    .on("error", (err) => {
      console.error(`[STARTUP] ✗ ML service is OFFLINE — ${err.message}`);
      console.error(
        `[STARTUP]   Start it with: cd ml_service && python server.py`,
      );
    });
});

module.exports = app;
