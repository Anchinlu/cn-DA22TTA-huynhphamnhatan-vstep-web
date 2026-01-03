import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import classRoutes from "./routes/classes.js";
import assignmentRoutes from "./routes/assignments.js";
import practiceRoutes from "./routes/practice.js";
import resultsRoutes from "./routes/results.js";
import adminRoutes from "./routes/admin.js";
import profileRoutes from "./routes/profile.js";
import discussionRoutes from "./routes/discussion.js";
import mockTestRoutes from "./routes/mockTests.js";
import aiRoutes from "./routes/ai.js";
import dashboardRoutes from "./routes/dashboard.js";

// --- CẤU HÌNH MÔI TRƯỜNG ---
dotenv.config();

// Xử lý đường dẫn trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// [QUAN TRỌNG] Cấu hình phục vụ file tĩnh (Audio/Image)
app.use(express.static(path.join(__dirname, '../public'))); 

// --- HEALTH CHECK ---
app.get("/", (req, res) => {
  res.json({ 
    message: "✅ VSTEP Backend đang chạy!",
    version: "2.0 (Refactored)",
    status: "OK"
  });
});

// --- MOUNT ROUTES ---
// Auth routes (no /api prefix in router, add here)
app.use("/api", authRoutes);

// User management routes
app.use("/api/users", userRoutes);

// Class routes
app.use("/api/classes", classRoutes);

// Assignment routes
app.use("/api/assignments", assignmentRoutes);

// Practice (listening, reading, writing, speaking)
app.use("/api", practiceRoutes);

// Results routes
app.use("/api/results", resultsRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Profile routes
app.use("/api/profile", profileRoutes);

// Discussion routes
app.use("/api/classes", discussionRoutes);

// Mock tests routes
app.use("/api/mock-tests", mockTestRoutes);

// AI routes
app.use("/api", aiRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error("❌ Lỗi server:", err);
  res.status(err.status || 500).json({
    message: err.message || "Lỗi server",
  });
});

// --- NOT FOUND ---
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy endpoint" });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
  console.log("📝 Chế độ: Refactored Modular Architecture");
});

export default app;
