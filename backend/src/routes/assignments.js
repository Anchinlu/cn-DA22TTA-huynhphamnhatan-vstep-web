import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { JWT_SECRET } from "../utils/constants.js";

const router = express.Router();

// Middleware: Chỉ teacher (vai_tro_id = 2)
const requireTeacher = (req, res, next) => {
  if (!req.user || req.user.vaiTroId !== 2) {
    return res.status(403).json({ message: "Chỉ giáo viên mới có quyền" });
  }
  next();
};

// Middleware: Chỉ student (vai_tro_id = 1)
const requireStudent = (req, res, next) => {
  if (!req.user || req.user.vaiTroId !== 1) {
    return res.status(403).json({ message: "Chỉ học sinh mới có quyền" });
  }
  next();
};

// Middleware: Verify Token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// [TEACHER] Lấy danh sách bài nộp
router.get("/:id/submissions", verifyToken, requireTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT bn.*, u.ho_ten, u.email FROM bai_nop bn JOIN nguoi_dung u ON bn.user_id = u.user_id
                 WHERE bn.bai_tap_id = ? ORDER BY bn.ngay_nop DESC`;
    const [subs] = await pool.query(sql, [id]);
    res.status(200).json(subs);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [STUDENT/TEACHER] Lấy chi tiết bài tập
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM bai_tap WHERE id = ?", [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bài tập" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [TEACHER] Chấm điểm bài nộp
router.post("/:id/grade", verifyToken, requireTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { diem, nhan_xet } = req.body;
    await pool.query("UPDATE bai_nop SET diem = ?, nhan_xet = ?, trang_thai_cham = 'da_cham' WHERE bai_nop_id = ?", [diem, nhan_xet, id]);
    res.status(200).json({ message: "Đã chấm!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [STUDENT] Lấy bài nộp của học sinh
router.get("/:id/my-submission", verifyToken, requireStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT * FROM bai_nop WHERE bai_tap_id = ? AND user_id = ?`;
    const [rows] = await pool.query(sql, [id, req.user.userId]);

    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [STUDENT] Nộp bài tập
router.post("/:id/submit", verifyToken, requireStudent, async (req, res) => {
  try {
    const baiTapId = req.params.id;
    const { link_nop_bai } = req.body;
    const userId = req.user.userId;

    const [check] = await pool.query(
      "SELECT bai_nop_id FROM bai_nop WHERE bai_tap_id = ? AND user_id = ?",
      [baiTapId, userId]
    );

    if (check.length > 0) {
      await pool.query(
        "UPDATE bai_nop SET link_nop_bai = ?, ngay_nop = NOW() WHERE bai_nop_id = ?",
        [link_nop_bai, check[0].bai_nop_id]
      );
      res.json({ message: "Cập nhật bài nộp thành công!" });
    } else {
      await pool.query(
        "INSERT INTO bai_nop (bai_tap_id, user_id, link_nop_bai, ngay_nop, trang_thai_cham) VALUES (?, ?, ?, NOW(), 'chua_cham')",
        [baiTapId, userId, link_nop_bai]
      );
      res.json({ message: "Nộp bài thành công!" });
    }
  } catch (err) {
    console.error("SQL Error:", err.message);
    res.status(500).json({ message: "Lỗi Server: " + (err.sqlMessage || err.message) });
  }
});

export default router;
