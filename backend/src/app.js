import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import bcrypt from "bcrypt"; // <--- THÊM VÀO
import jwt from "jsonwebtoken"; // <--- THÊM VÀO

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) console.log("❌ Kết nối cơ sở dữ liệu không thành công:", err);
  else console.log("✅ Đã kết nối với cơ sở dữ liệu MySQL!");
});

app.get("/", (req, res) => {
  res.send("✅ VSTEP Backend đang chạy thành công!");
});

// === API ĐĂNG NHẬP MỚI ===
app.post("/api/login", (req, res) => {
  // 1. Lấy email và mat_khau từ frontend gửi lên
  const { email, mat_khau } = req.body;

  // 2. Viết câu SQL để tìm người dùng dựa trên email
  // (Sử dụng tên bảng và cột từ file Thiet_ke_CSDL_...docx)
  const sql = "SELECT * FROM nguoi_dung WHERE email = ?";
  
  db.query(sql, [email], (err, results) => {
    if (err) {
      // Lỗi server
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }

    // 3. Kiểm tra xem có tìm thấy người dùng không
    if (results.length === 0) {
      // Không tìm thấy email
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const user = results[0];

    // 4. So sánh mật khẩu đã mã hóa
    // (Vì chúng ta chưa có đăng ký, hãy tạm thời bỏ qua bcrypt nếu bạn
    // đang nhập mật khẩu_thường trong CSDL. 
    // Nếu bạn đã mã hóa, hãy dùng code 'bcrypt.compare' bên dưới)

    /*
    // --- Code đầy đủ nếu mật khẩu đã được mã hóa ---
    bcrypt.compare(mat_khau, user.mat_khau, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        return res.status(500).json({ message: "Lỗi so sánh mật khẩu" });
      }

      if (!isMatch) {
        // Sai mật khẩu
        return res.status(401).json({ message: "Sai mật khẩu" });
      }

      // === Đăng nhập thành công ===
      // 5. Tạo JWT Token
      const token = jwt.sign(
        { userId: user.user_id, vaiTro: user.vai_tro_id },
        process.env.JWT_SECRET || "BI_MAT_CUA_BAN", // Hãy thêm JWT_SECRET vào file .env
        { expiresIn: "1h" }
      );

      // 6. Trả về token và thông tin người dùng
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
    });
    */
    
    // --- Code đơn giản nếu mật khẩu CHƯA mã hóa (chỉ để TEST) ---
    if (mat_khau !== user.mat_khau) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }
    // === Đăng nhập thành công (TEST) ===
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
  });
});
// === KẾT THÚC API ĐĂNG NHẬP ===


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Máy chủ đã khởi động trên cổng ${PORT}`));