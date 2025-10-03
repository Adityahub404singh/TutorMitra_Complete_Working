import "dotenv/config";
import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import fs from "fs";
import path from "path";

// Route Imports
import authRoutes from "./routes/auth.js";

import tutorRoutes from "./routes/Tutor.js";
import bookingRoutes from "./routes/booking.js";
import courseRoutes from "./routes/Courses.js";
import chatRoutes from "./routes/Chat.js";
import paymentRoutes from "./routes/payment.js";
import reviewRoutes from "./routes/Review.js";
import userRoutes from "./routes/User.js";
import uploadRoutes from "./routes/upload.js";
import { setupSocketIO } from "./socket.js";

const app = express();

// ---------------- UPLOAD FOLDER + STATIC SERVE (One Time, Top) ----------------
const uploadsFolder = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
  console.log("✅ Created uploads directory");
}
app.use("/uploads", express.static(uploadsFolder));

// ---------------- CORS Middleware (Allows image upload from frontend!) ----------------
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------------- Body Parsing ----------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ---------------- Upload API Route (Mount HIGH!) ----------------
app.use(uploadRoutes); // Must be directly after static and CORS, before other APIs

// ---------------- Session & Passport ----------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tutormitra-secret-2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
import "./config/passport.js";

// ---------------- API Routes ----------------
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/user", userRoutes);

// ---------------- Health & Test ----------------
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "TutorMitra Backend Working!",
    timestamp: new Date().toISOString(),
    uploads: fs.existsSync(uploadsFolder) ? "Ready" : "Missing",
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ---------------- Global Error Handler ----------------
app.use((error, req, res, next) => {
  console.error("🔥 Global Error:", error);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message,
    timestamp: new Date().toISOString(),
  });
});

// ---------------- 404 Handler ----------------
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      "GET /api/test",
      "GET /api/courses",
      "POST /api/courses/seed",
      "GET /api/tutors",
      "POST /api/tutors/profile",
    ],
  });
});

// ---------------- MongoDB Connect ----------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tutormitra")
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log(`📄 Database: ${mongoose.connection.name}`);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// ---------------- HTTP Server & Socket.IO ----------------
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});
setupSocketIO(io);
(global).io = io;

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 TutorMitra Server running on port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
  console.log(`🔗 Courses: http://localhost:${PORT}/api/courses`);
});

export default app;
