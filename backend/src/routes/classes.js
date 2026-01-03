import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { JWT_SECRET } from "../utils/constants.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// [TEACHER] Tạo lớp học mới
router.post("/", verifyToken, requireRole(2), async (req, res) => {
  try {
    const { ten_lop, mo_ta } = req.body;
    const ma_lop = "VS" + Math.floor(1000 + Math.random() * 9000);

    await pool.query(
      "INSERT INTO lop_hoc (ten_lop, ma_lop, mo_ta, giao_vien_id) VALUES (?, ?, ?, ?)",
      [ten_lop, ma_lop, mo_ta, req.user.userId]
    );

    res.json({ message: "Tạo lớp thành công!", ma_lop });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Lỗi tạo lớp" });
  }
});

// [ADMIN/TEACHER] Lấy danh sách lớp học
router.get("/", verifyToken, async (req, res) => {
  try {
    const roleId = parseInt(req.user.vaiTroId);
    const userId = req.user.userId;

    let sql = "";
    let params = [];

    if (roleId === 3) {
      sql = `
        SELECT lh.*, nd.ho_ten as giao_vien_ten,
        (SELECT COUNT(*) FROM thanh_vien_lop WHERE lop_hoc_id = lh.id) as si_so
        FROM lop_hoc lh
        LEFT JOIN nguoi_dung nd ON lh.giao_vien_id = nd.user_id 
        ORDER BY lh.ngay_tao DESC`;
    } else {
      sql = `
        SELECT lh.*, 
        (SELECT COUNT(*) FROM thanh_vien_lop WHERE lop_hoc_id = lh.id) as si_so
        FROM lop_hoc lh
        WHERE lh.giao_vien_id = ? 
        ORDER BY lh.ngay_tao DESC`;
      params = [userId];
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Lỗi SQL:", err.message);
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
});

// [TEACHER] Lấy danh sách lớp
router.get("/teacher/classes", verifyToken, requireRole(2), async (req, res) => {
  try {
    const sql = `SELECT l.*, COUNT(tv.id) as so_hoc_vien FROM lop_hoc l 
                 LEFT JOIN thanh_vien_lop tv ON l.id = tv.lop_hoc_id 
                 WHERE l.giao_vien_id = ? GROUP BY l.id ORDER BY l.ngay_tao DESC`;
    const [classes] = await pool.query(sql, [req.user.userId]);
    res.status(200).json(classes || []);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [STUDENT] Tham gia lớp
router.post("/join", verifyToken, requireRole(1), async (req, res) => {
  try {
    const { ma_lop } = req.body;

    const [classes] = await pool.query("SELECT * FROM lop_hoc WHERE ma_lop = ?", [ma_lop]);
    if (classes.length === 0) return res.status(404).json({ message: "Mã lớp không tồn tại." });

    const classId = classes[0].id;
    const [exists] = await pool.query("SELECT * FROM thanh_vien_lop WHERE lop_hoc_id = ? AND hoc_vien_id = ?", [classId, req.user.userId]);

    if (exists.length > 0) return res.status(409).json({ message: "Đã tham gia hoặc đang chờ duyệt." });

    await pool.query("INSERT INTO thanh_vien_lop (lop_hoc_id, hoc_vien_id, trang_thai) VALUES (?, ?, 'pending')", [classId, req.user.userId]);
    res.status(200).json({ message: `Đã gửi yêu cầu vào lớp: ${classes[0].ten_lop}` });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [STUDENT] Lấy danh sách lớp đã tham gia
router.get("/student/classes", verifyToken, requireRole(1), async (req, res) => {
  try {
    const sql = `SELECT l.*, u.ho_ten as giao_vien, tv.trang_thai FROM thanh_vien_lop tv
                 JOIN lop_hoc l ON tv.lop_hoc_id = l.id
                 JOIN nguoi_dung u ON l.giao_vien_id = u.user_id
                 WHERE tv.hoc_vien_id = ? ORDER BY tv.ngay_tham_gia DESC`;
    const [classes] = await pool.query(sql, [req.user.userId]);
    res.status(200).json(classes || []);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [TEACHER] Duyệt thành viên
router.post("/approve", verifyToken, requireRole(2), async (req, res) => {
  try {
    const { class_id, student_id, action } = req.body;
    if (action === 'approve') {
      await pool.query("UPDATE thanh_vien_lop SET trang_thai = 'approved' WHERE lop_hoc_id = ? AND hoc_vien_id = ?", [class_id, student_id]);
    } else {
      await pool.query("DELETE FROM thanh_vien_lop WHERE lop_hoc_id = ? AND hoc_vien_id = ?", [class_id, student_id]);
    }
    res.status(200).json({ message: "Thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [COMMON] Chi tiết lớp
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT l.*, u.ho_ten as giao_vien FROM lop_hoc l JOIN nguoi_dung u ON l.giao_vien_id = u.user_id WHERE l.id = ?`;
    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy lớp" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [COMMON] Thành viên trong lớp
router.get("/:id/members", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT tv.id, u.user_id, u.ho_ten, u.email, tv.ngay_tham_gia, tv.trang_thai
                 FROM thanh_vien_lop tv JOIN nguoi_dung u ON tv.hoc_vien_id = u.user_id
                 WHERE tv.lop_hoc_id = ? ORDER BY tv.trang_thai DESC`;
    const [members] = await pool.query(sql, [id]);
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [COMMON] Lấy bài tập trong lớp
router.get("/:id/assignments", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM bai_tap WHERE lop_hoc_id = ? ORDER BY ngay_tao DESC", [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [TEACHER] Giao bài tập
router.post("/:id/assignments", verifyToken, requireRole(2), async (req, res) => {
  try {
    const classId = req.params.id;
    const { tieu_de, mo_ta, han_nop, kieu_nop } = req.body;
    const sql = "INSERT INTO bai_tap (lop_hoc_id, tieu_de, mo_ta, han_nop, kieu_nop) VALUES (?, ?, ?, ?, ?)";
    await pool.query(sql, [classId, tieu_de, mo_ta, han_nop, kieu_nop]);
    res.status(201).json({ message: "Giao bài thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [TEACHER] Cập nhật thông tin lớp
router.put("/:id", verifyToken, requireRole(2), async (req, res) => {
  try {
    const { mo_ta, ten_lop } = req.body;
    await pool.query("UPDATE lop_hoc SET mo_ta = ?, ten_lop = ? WHERE id = ?", [mo_ta, ten_lop, req.params.id]);
    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [COMMON] Lấy danh sách tài liệu của lớp
router.get("/:id/documents", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tai_lieu_lop WHERE lop_hoc_id = ? ORDER BY ngay_tao DESC", [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [TEACHER] Thêm tài liệu mới
router.post("/:id/documents", verifyToken, requireRole(2), async (req, res) => {
  try {
    const { ten_tai_lieu, duong_dan, loai_file } = req.body;
    await pool.query(
      "INSERT INTO tai_lieu_lop (lop_hoc_id, ten_tai_lieu, duong_dan, loai_file) VALUES (?, ?, ?, ?)",
      [req.params.id, ten_tai_lieu, duong_dan, loai_file]
    );
    res.json({ message: "Đã thêm tài liệu!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [TEACHER] Xóa tài liệu
router.delete("/documents/:docId", verifyToken, requireRole(2), async (req, res) => {
  try {
    await pool.query("DELETE FROM tai_lieu_lop WHERE id = ?", [req.params.docId]);
    res.json({ message: "Đã xóa tài liệu" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
