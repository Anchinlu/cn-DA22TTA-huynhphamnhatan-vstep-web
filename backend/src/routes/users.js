import express from "express";
import pool from "../config/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const sql = `SELECT u.user_id, u.ho_ten, u.email, u.vai_tro_id, u.ngay_tao, v.ten_vai_tro 
                 FROM nguoi_dung u LEFT JOIN vai_tro v ON u.vai_tro_id = v.vai_tro_id 
                 ORDER BY u.user_id DESC LIMIT 50`;
    const [users] = await pool.query(sql);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.put("/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { vaiTroId } = req.body;
    await pool.query("UPDATE nguoi_dung SET vai_tro_id = ? WHERE user_id = ?", [vaiTroId, id]);
    res.status(200).json({ message: "Cập nhật thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM nguoi_dung WHERE user_id = ?", [id]);
    res.status(200).json({ message: "Đã xóa user." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
