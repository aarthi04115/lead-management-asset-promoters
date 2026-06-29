const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const siteVisitRoutes = require("./routes/siteVisitRoutes");
const roundRobinRoutes = require("./routes/roundrobin");
const dashboardRoutes = require("./routes/dashboardRoutes");
const emailService = require("./services/emailService");

dotenv.config();

// Fail fast if critical env vars are missing
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  console.error("Copy .env.example to .env and fill in the values.");
  process.exit(1);
}

connectDB();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Only log in development so test/CI output stays clean
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport for Google OAuth
if (process.env.GOOGLE_CLIENT_ID) {
  const passport = require("./config/passport");
  app.use(passport.initialize());
}

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/roundrobin", roundRobinRoutes);
app.use("/api/followups", followUpRoutes);
app.use("/api/sitevisits", siteVisitRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (_req, res) =>
  res.json({ success: true, uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

const errorHandler = require("./middleware/errorHandler");

// ... (other code)

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Auth routes mounted at /api/auth`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
