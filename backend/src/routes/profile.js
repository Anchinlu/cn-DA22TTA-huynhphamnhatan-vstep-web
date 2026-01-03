import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { JWT_SECRET } from "../utils/constants.js";

const router = express.Router();

// Lấy thống kê Profile
router.get("/stats", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const [users] = await pool.query("SELECT ho_ten, email, ngay_tao FROM nguoi_dung WHERE user_id = ?", [userId]);
    const user = users[0];

    const sqlStats = `
      SELECT 
        COUNT(*) as total_tests,
        AVG(diem_so) as overall_avg,
        SUM(thoi_gian_lam) as total_time,
        SUM(CASE WHEN ky_nang = 'listening' THEN 1 ELSE 0 END) as listening_count,
        AVG(CASE WHEN ky_nang = 'listening' THEN diem_so ELSE NULL END) as listening_avg,
        SUM(CASE WHEN ky_nang = 'reading' THEN 1 ELSE 0 END) as reading_count,
        AVG(CASE WHEN ky_nang = 'reading' THEN diem_so ELSE NULL END) as reading_avg,
        SUM(CASE WHEN ky_nang = 'writing' THEN 1 ELSE 0 END) as writing_count,
        AVG(CASE WHEN ky_nang = 'writing' THEN diem_so ELSE NULL END) as writing_avg,
        SUM(CASE WHEN ky_nang = 'speaking' THEN 1 ELSE 0 END) as speaking_count,
        AVG(CASE WHEN ky_nang = 'speaking' THEN diem_so ELSE NULL END) as speaking_avg
      FROM lich_su_lam_bai 
      WHERE user_id = ?
    `;
    const [stats] = await pool.query(sqlStats, [userId]);

    const [recent] = await pool.query(`
        SELECT id, ky_nang, tieu_de_bai_thi, diem_so, ngay_lam 
        FROM lich_su_lam_bai 
        WHERE user_id = ? 
        ORDER BY ngay_lam DESC LIMIT 5
    `, [userId]);

    res.json({
      user: user,
      stats: stats[0],
      recent_activity: recent.map(r => ({
        ...r,
        ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN'),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy Profile" });
  }
});

// Gửi yêu cầu nâng cấp giáo viên
router.post("/teacher-request", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const { so_dien_thoai, trinh_do, kinh_nghiem, link_cv } = req.body;

    const [exists] = await pool.query("SELECT * FROM yeu_cau_nang_cap WHERE user_id = ? AND trang_thai = 'pending'", [decoded.userId]);
    if (exists.length > 0) return res.status(400).json({ message: "Bạn đã gửi yêu cầu rồi, vui lòng chờ duyệt." });

    await pool.query(
      "INSERT INTO yeu_cau_nang_cap (user_id, so_dien_thoai, trinh_do, kinh_nghiem, link_cv) VALUES (?, ?, ?, ?, ?)",
      [decoded.userId, so_dien_thoai, trinh_do, kinh_nghiem, link_cv]
    );

    res.json({ message: "Gửi yêu cầu thành công! Admin sẽ xét duyệt sớm." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
