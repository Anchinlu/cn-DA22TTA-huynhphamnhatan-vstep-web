import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { JWT_SECRET } from "../utils/constants.js";

const router = express.Router();

// Lấy danh sách tin nhắn lớp
router.get("/:id/discussions", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT d.*, u.ho_ten, u.vai_tro_id 
      FROM lop_hoc_thao_luan d
      JOIN nguoi_dung u ON d.user_id = u.user_id
      WHERE d.lop_hoc_id = ?
      ORDER BY d.ngay_tao ASC
    `;
    const [rows] = await pool.query(sql, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Gửi tin nhắn lớp
router.post("/:id/discussions", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const { id } = req.params;
    const { noi_dung } = req.body;

    await pool.query(
      "INSERT INTO lop_hoc_thao_luan (lop_hoc_id, user_id, noi_dung) VALUES (?, ?, ?)",
      [id, decoded.userId, noi_dung]
    );

    res.status(201).json({ message: "Đã gửi tin nhắn" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi gửi tin" });
  }
});

export default router;
