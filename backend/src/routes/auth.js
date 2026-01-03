import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/database.js";
import transporter from "../config/email.js";
import { JWT_SECRET } from "../utils/constants.js";

const router = express.Router();

// Đăng Nhập
router.post("/login", async (req, res) => {
  try {
    const { email, mat_khau } = req.body;
    const [results] = await pool.query("SELECT * FROM nguoi_dung WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);

    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { userId: user.user_id, vaiTroId: user.vai_tro_id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: { id: user.user_id, hoTen: user.ho_ten, email: user.email, vaiTroId: user.vai_tro_id },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// Đăng Ký
router.post("/register", async (req, res) => {
  try {
    const { ho_ten, email, mat_khau } = req.body;
    const [results] = await pool.query("SELECT * FROM nguoi_dung WHERE email = ?", [email]);
    if (results.length > 0) return res.status(409).json({ message: "Email đã tồn tại" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(mat_khau, salt);

    await pool.query(
      "INSERT INTO nguoi_dung (ho_ten, email, mat_khau, vai_tro_id, ngay_tao) VALUES (?, ?, ?, ?, NOW())",
      [ho_ten, email, hash, 1]
    );

    res.status(201).json({ message: "Tạo tài khoản thành công!" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// Quên Mật Khẩu
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.query("SELECT * FROM nguoi_dung WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "UPDATE nguoi_dung SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [resetToken, expiry, email]
    );

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: '"VSTEP Support" <no-reply@vstep.com>',
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu - VSTEP Pro",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">Xin chào ${users[0].ho_ten},</h2>
          <p>Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào nút dưới đây để tạo mật khẩu mới:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Đặt lại mật khẩu</a>
          <p style="margin-top: 20px;">Link này sẽ hết hạn sau 15 phút.</p>
          <p style="color: #666; font-size: 12px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });

    res.json({ message: "Đã gửi link đặt lại mật khẩu vào email của bạn!" });
  } catch (err) {
    console.error("Mail Error:", err);
    res.status(500).json({ message: "Lỗi gửi email. Vui lòng thử lại sau." });
  }
});

// Reset Mật Khẩu
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const [users] = await pool.query(
      "SELECT * FROM nguoi_dung WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Link không hợp lệ hoặc đã hết hạn." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      "UPDATE nguoi_dung SET mat_khau = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?",
      [hashedPassword, users[0].user_id]
    );

    res.json({ message: "Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay." });
  } catch (err) {
    console.error("Reset Pass Error:", err);
    res.status(500).json({ message: "Lỗi server." });
  }
});

export default router;
