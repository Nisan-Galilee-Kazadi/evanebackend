require("dotenv").config();
const express = require("express");
const cors = require('cors');
const path = require('path');
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const orderRoutes = require("./routes/orders");
const achievementRoutes = require("./routes/achievements");
const videoRoutes = require("./routes/videos");
const mediaRoutes = require("./routes/media");
const contactRoutes = require("./routes/contact");

const app = express();
app.enable('trust proxy'); // Required for req.protocol to detect https on Render

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public/media
app.use('/media', express.static(path.join(__dirname, 'public', 'media'), {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/contact", contactRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});
