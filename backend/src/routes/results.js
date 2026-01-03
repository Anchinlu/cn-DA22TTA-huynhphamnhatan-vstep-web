import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { JWT_SECRET } from "../utils/constants.js";

const router = express.Router();

// Lưu kết quả
router.post("/", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const { skill, level, score, duration, testTitle, bai_lam_text, ai_feedback } = req.body;

    const sql = `INSERT INTO lich_su_lam_bai 
        (user_id, ky_nang, trinh_do, diem_so, thoi_gian_lam, tieu_de_bai_thi, bai_lam_text, ai_feedback, ngay_lam) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    await pool.query(sql, [
      decoded.userId,
      skill,
      level,
      score,
      duration,
      testTitle || 'Bài luyện tập',
      bai_lam_text || null,
      ai_feedback ? JSON.stringify(ai_feedback) : null,
    ]);

    res.status(201).json({ message: "Saved!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lưu điểm." });
  }
});

// Lấy lịch sử
router.get("/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const sql = "SELECT * FROM lich_su_lam_bai WHERE user_id = ? ORDER BY ngay_lam DESC LIMIT 20";
    const [history] = await pool.query(sql, [decoded.userId]);

    const formatted = history.map(h => ({
      ...h,
      date: new Date(h.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(h.ngay_lam).toLocaleTimeString('vi-VN'),
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server." });
  }
});

export default router;
