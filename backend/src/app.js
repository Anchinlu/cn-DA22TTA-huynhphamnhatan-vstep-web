import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 

// === (MỚI) IMPORT ĐỂ XỬ LÝ ĐƯỜNG DẪN ===
// (Removed static image serving and related path helpers)
// ======================================

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// (Pool kết nối CSDL - Giữ nguyên)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log("✅ Đã kết nối với cơ sở dữ liệu MySQL (Pool)!");
    connection.release(); 
  })
  .catch(err => {
    console.log("❌ Kết nối cơ sở dữ liệu không thành công:", err);
  });

// Static image serving removed — frontend will serve assets directly.

app.get("/", (req, res) => {
  res.send("✅ VSTEP Backend đang chạy thành công!");
});

// === (MỚI) API GET SLIDESHOW ===
app.get("/api/slideshow", async (req, res) => {
  try {
    // Truy vấn bảng 'slideshow' và sắp xếp theo cột 'thu_tu'
    const sql = "SELECT * FROM slideshow ORDER BY thu_tu ASC";
    const [slides] = await pool.query(sql);
    
    // Trả về dữ liệu slides (dưới dạng JSON)
    res.status(200).json(slides);

  } catch (err) {
    console.error("Lỗi API Slideshow:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});
// ==============================

// === API ĐĂNG NHẬP (Giữ nguyên) ===
app.post("/api/login", async (req, res) => {
  try {
    const { email, mat_khau } = req.body;
    const sql = "SELECT * FROM nguoi_dung WHERE email = ?";
    
    const [results] = await pool.query(sql, [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    // (Cho phép đăng nhập bằng mật khẩu test '123456' nếu chưa mã hóa)
    if (!isMatch && mat_khau !== user.mat_khau) { 
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // === Đăng nhập thành công ===
    const token = jwt.sign(
      { userId: user.user_id, vaiTroId: user.vai_tro_id },
      process.env.JWT_SECRET || "BI_MAT_CUA_BAN",
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Đăng nhập thành công",
      token: token,
      user: {
        id: user.user_id,
        hoTen: user.ho_ten,
        email: user.email,
        vaiTroId: user.vai_tro_id
      }
    });

  } catch (err) {
    console.error("Lỗi API Đăng nhập:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// === API ĐĂNG KÝ (Giữ nguyên) ===
app.post("/api/register", async (req, res) => {
  try {
    const { ho_ten, email, mat_khau } = req.body;

    const checkEmailSql = "SELECT * FROM nguoi_dung WHERE email = ?";
    const [results] = await pool.query(checkEmailSql, [email]);

    if (results.length > 0) {
      return res.status(409).json({ message: "Email này đã được sử dụng" });
    }

    const salt = await bcrypt.genSalt(10);
    const matKhauMaHoa = await bcrypt.hash(mat_khau, salt);

    const insertSql = "INSERT INTO nguoi_dung (ho_ten, email, mat_khau, vai_tro_id, ngay_tao) VALUES (?, ?, ?, ?, NOW())";
    await pool.query(insertSql, [ho_ten, email, matKhauMaHoa, 1]); 
        
    res.status(201).json({ message: "Tạo tài khoản thành công!" });

  } catch (err) {
    console.error("Lỗi API Đăng ký:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Máy chủ đã khởi động trên cổng ${PORT}`));