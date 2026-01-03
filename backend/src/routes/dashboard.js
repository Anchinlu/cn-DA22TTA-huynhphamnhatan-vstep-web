import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { JWT_SECRET } from "../utils/constants.js";

const router = express.Router();

// Dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const roleId = decoded.vaiTroId;

    let stats = {
      totalClasses: 0,
      totalStudents: 0,
      pendingStudents: 0,
      totalAssignments: 0,
      upcomingDeadlines: [],
      totalTeachers: 0,
      recentUsers: [],
    };

    if (roleId === 2) {
      const [classes] = await pool.query("SELECT COUNT(*) as count FROM lop_hoc WHERE giao_vien_id = ?", [userId]);
      stats.totalClasses = classes[0].count;

      const [students] = await pool.query(
        `SELECT COUNT(*) as count FROM thanh_vien_lop tv JOIN lop_hoc lh ON tv.lop_hoc_id = lh.id WHERE lh.giao_vien_id = ? AND tv.trang_thai = 'approved'`,
        [userId]
      );
      stats.totalStudents = students[0].count;

      const [pending] = await pool.query(
        `SELECT COUNT(*) as count FROM thanh_vien_lop tv JOIN lop_hoc lh ON tv.lop_hoc_id = lh.id WHERE lh.giao_vien_id = ? AND tv.trang_thai = 'pending'`,
        [userId]
      );
      stats.pendingStudents = pending[0].count;

      const [assigns] = await pool.query(
        `SELECT COUNT(*) as count FROM bai_tap bt JOIN lop_hoc lh ON bt.lop_hoc_id = lh.id WHERE lh.giao_vien_id = ?`,
        [userId]
      );
      stats.totalAssignments = assigns[0].count;

      const [deadlines] = await pool.query(
        `SELECT bt.id, bt.tieu_de, bt.han_nop, lh.ma_lop FROM bai_tap bt JOIN lop_hoc lh ON bt.lop_hoc_id = lh.id WHERE lh.giao_vien_id = ? AND bt.han_nop >= CURDATE() ORDER BY bt.han_nop ASC LIMIT 5`,
        [userId]
      );
      stats.upcomingDeadlines = deadlines;
    } else if (roleId === 3) {
      const [c] = await pool.query("SELECT COUNT(*) as count FROM lop_hoc");
      const [u] = await pool.query("SELECT COUNT(*) as count FROM nguoi_dung WHERE vai_tro_id = 1");
      const [t] = await pool.query("SELECT COUNT(*) as count FROM nguoi_dung WHERE vai_tro_id = 2");
      const [recent] = await pool.query("SELECT user_id as id, ho_ten, email, vai_tro_id, ngay_tao FROM nguoi_dung ORDER BY ngay_tao DESC LIMIT 5");

      stats.totalClasses = c[0].count;
      stats.totalStudents = u[0].count;
      stats.totalTeachers = t[0].count;
      stats.recentUsers = recent;
    }

    res.json(stats);
  } catch (err) {
    console.error("Lỗi API /stats:", err);
    res.status(500).json({ message: "Lỗi lấy thống kê", detail: err.message });
  }
});

// Teacher Dashboard Stats
router.get("/teacher/stats", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const teacherId = decoded.userId;

    const [classes] = await pool.query("SELECT COUNT(*) as count FROM lop_hoc WHERE giao_vien_id = ?", [teacherId]);

    const [students] = await pool.query(
      `SELECT COUNT(DISTINCT hoc_vien_id) as count 
       FROM thanh_vien_lop 
       JOIN lop_hoc ON thanh_vien_lop.lop_hoc_id = lop_hoc.id 
       WHERE lop_hoc.giao_vien_id = ? AND thanh_vien_lop.trang_thai = 'approved'`,
      [teacherId]
    );

    const [pending] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM bai_nop 
       JOIN bai_tap ON bai_nop.bai_tap_id = bai_tap.id 
       JOIN lop_hoc ON bai_tap.lop_hoc_id = lop_hoc.id
       WHERE lop_hoc.giao_vien_id = ? AND bai_nop.trang_thai_cham = 'chua_cham'`,
      [teacherId]
    );

    const [assignments] = await pool.query(
      `SELECT COUNT(*) as count FROM bai_tap 
       JOIN lop_hoc ON bai_tap.lop_hoc_id = lop_hoc.id
       WHERE lop_hoc.giao_vien_id = ?`,
      [teacherId]
    );

    const [chart] = await pool.query(
      `SELECT 
          DATE(bai_nop.ngay_nop) as raw_date, 
          DATE_FORMAT(bai_nop.ngay_nop, '%d/%m') as date, 
          COUNT(*) as count 
       FROM bai_nop 
       JOIN bai_tap ON bai_nop.bai_tap_id = bai_tap.id 
       JOIN lop_hoc ON bai_tap.lop_hoc_id = lop_hoc.id
       WHERE lop_hoc.giao_vien_id = ? 
       AND bai_nop.ngay_nop >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY raw_date, date 
       ORDER BY raw_date ASC`,
      [teacherId]
    );

    const [deadlines] = await pool.query(
      `SELECT bt.id, bt.tieu_de, bt.han_nop, lh.ten_lop 
       FROM bai_tap bt
       JOIN lop_hoc lh ON bt.lop_hoc_id = lh.id
       WHERE lh.giao_vien_id = ? AND bt.han_nop > NOW()
       ORDER BY bt.han_nop ASC LIMIT 5`,
      [teacherId]
    );

    res.json({
      totalClasses: classes[0].count,
      totalStudents: students[0].count,
      pendingSubmissions: pending[0].count,
      totalAssignments: assignments[0].count,
      submissionChart: chart,
      upcomingDeadlines: deadlines,
    });
  } catch (err) {
    console.error("Lỗi API Thống kê:", err.message);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// Teacher Requests
router.get("/admin/teacher-requests", async (req, res) => {
  try {
    const sql = `
      SELECT y.*, u.ho_ten, u.email 
      FROM yeu_cau_nang_cap y
      JOIN nguoi_dung u ON y.user_id = u.user_id
      WHERE y.trang_thai = 'pending'
      ORDER BY y.ngay_tao DESC
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Approve/Reject Teacher Request
router.post("/admin/teacher-requests/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const { action } = req.body;

    const [reqs] = await pool.query("SELECT * FROM yeu_cau_nang_cap WHERE id = ?", [requestId]);
    if (reqs.length === 0) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    const request = reqs[0];

    if (action === 'approve') {
      await pool.query("UPDATE yeu_cau_nang_cap SET trang_thai = 'approved' WHERE id = ?", [requestId]);
      await pool.query("UPDATE nguoi_dung SET vai_tro_id = 2 WHERE user_id = ?", [request.user_id]);
      res.json({ message: "Đã duyệt thành công!" });
    } else {
      await pool.query("UPDATE yeu_cau_nang_cap SET trang_thai = 'rejected' WHERE id = ?", [requestId]);
      res.json({ message: "Đã từ chối yêu cầu." });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
