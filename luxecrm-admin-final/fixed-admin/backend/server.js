const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Allow any localhost port — admin on 5173, employee on 5174, etc.
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// 50mb limit to handle base64 image + PDF storage
app.use(express.json({ limit: "50mb" }));

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/luxecrm";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected:", MONGO_URI))
  .catch((err) => { console.error("❌ MongoDB error:", err.message); process.exit(1); });

const propertyRoutes = require("./routes/properties");
app.use("/api/properties", propertyRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
