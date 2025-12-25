import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 
import path from 'path'; 
import { fileURLToPath } from 'url';

// --- CẤU HÌNH MÔI TRƯỜNG ---
dotenv.config();

// Xử lý đường dẫn trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- KEY BÍ MẬT (QUAN TRỌNG: DÙNG CHUNG CHO TOÀN APP) ---
const JWT_SECRET = process.env.JWT_SECRET || "VSTEP_PRO_SECRET_KEY_2025";

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// [QUAN TRỌNG] Cấu hình phục vụ file tĩnh (Audio/Image)
app.use(express.static(path.join(__dirname, '../public'))); 

// --- KẾT NỐI DATABASE (MySQL Connection Pool) ---
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
  .then(conn => {
    console.log("✅ Đã kết nối Database thành công!");
    conn.release(); 
  })
  .catch(err => console.error("❌ Lỗi kết nối DB:", err.message));

app.get("/", (req, res) => res.send("✅ VSTEP Backend đang chạy!"));

// ============================================================
// 1. AUTHENTICATION (Đăng nhập - Đăng ký)
// ============================================================

// Đăng Nhập
app.post("/api/login", async (req, res) => {
  try {
    const { email, mat_khau } = req.body;
    
    // Tìm user theo email
    const [results] = await pool.query("SELECT * FROM nguoi_dung WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const user = results[0];

    // So sánh mật khẩu (Chỉ dùng Bcrypt)
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // Tạo Token
    const token = jwt.sign(
      { userId: user.user_id, vaiTroId: user.vai_tro_id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: { id: user.user_id, hoTen: user.ho_ten, email: user.email, vaiTroId: user.vai_tro_id }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// Đăng Ký
app.post("/api/register", async (req, res) => {
  try {
    const { ho_ten, email, mat_khau } = req.body;
    
    // Kiểm tra email tồn tại
    const [results] = await pool.query("SELECT * FROM nguoi_dung WHERE email = ?", [email]);
    if (results.length > 0) return res.status(409).json({ message: "Email đã tồn tại" });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(mat_khau, salt);

    // Lưu vào DB (Mặc định vai trò 1 - Học viên)
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

// ============================================================
// 2. ADMIN & USER MANAGEMENT
// ============================================================

app.get("/api/users", async (req, res) => {
  try {
    const sql = `SELECT u.user_id, u.ho_ten, u.email, u.vai_tro_id, u.ngay_tao, v.ten_vai_tro 
                 FROM nguoi_dung u LEFT JOIN vai_tro v ON u.vai_tro_id = v.vai_tro_id 
                 ORDER BY u.user_id DESC LIMIT 50`;
    const [users] = await pool.query(sql);
    res.status(200).json(users);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

app.put("/api/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { vaiTroId } = req.body;
    await pool.query("UPDATE nguoi_dung SET vai_tro_id = ? WHERE user_id = ?", [vaiTroId, id]);
    res.status(200).json({ message: "Cập nhật thành công!" });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM nguoi_dung WHERE user_id = ?", [id]);
    res.status(200).json({ message: "Đã xóa user." });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// ============================================================
// 3. CLASSROOM SYSTEM (Quản lý Lớp học)
// ============================================================

// [TEACHER] Tạo lớp học mới
app.post("/api/classes", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const { ten_lop, mo_ta } = req.body;

    const ma_lop = "VS" + Math.floor(1000 + Math.random() * 9000);

    // Insert đúng cột giao_vien_id
    await pool.query(
      "INSERT INTO lop_hoc (ten_lop, ma_lop, mo_ta, giao_vien_id) VALUES (?, ?, ?, ?)",
      [ten_lop, ma_lop, mo_ta, decoded.userId]
    );

    res.json({ message: "Tạo lớp thành công!", ma_lop });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo lớp" }); 
  }
});

// [ADMIN/TEACHER] Lấy danh sách lớp học
app.get("/api/classes", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const roleId = parseInt(decoded.vaiTroId); 
    const userId = decoded.userId;

    console.log(`[API Classes] User: ${userId}, Role: ${roleId}`);

    let sql = "";
    let params = [];

    if (roleId === 3) {
      // === ADMIN: Lấy tất cả lớp ===
      sql = `
        SELECT lh.*, nd.ho_ten as giao_vien_ten,
        (SELECT COUNT(*) FROM thanh_vien_lop WHERE lop_hoc_id = lh.id) as si_so
        FROM lop_hoc lh
        LEFT JOIN nguoi_dung nd ON lh.giao_vien_id = nd.user_id 
        ORDER BY lh.ngay_tao DESC`;
    } else {
      // === GIÁO VIÊN: Lấy lớp của mình ===
      sql = `
        SELECT lh.*, 
        (SELECT COUNT(*) FROM thanh_vien_lop WHERE lop_hoc_id = lh.id) as si_so
        FROM lop_hoc lh
        WHERE lh.giao_vien_id = ? 
        ORDER BY lh.ngay_tao DESC`;
      params = [userId];
    }

    const [rows] = await pool.query(sql, params);
    console.log(`-> Tìm thấy: ${rows.length} lớp.`);
    res.json(rows);

  } catch (err) {
    console.error("Lỗi SQL:", err);
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
});

// [TEACHER] Lấy danh sách lớp
app.get("/api/teacher/classes", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const sql = `SELECT l.*, COUNT(tv.id) as so_hoc_vien FROM lop_hoc l 
                 LEFT JOIN thanh_vien_lop tv ON l.id = tv.lop_hoc_id 
                 WHERE l.giao_vien_id = ? GROUP BY l.id ORDER BY l.ngay_tao DESC`;
    const [classes] = await pool.query(sql, [decoded.userId]);
    res.status(200).json(classes || []);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [STUDENT] Tham gia lớp
app.post("/api/classes/join", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập." });
    const decoded = jwt.verify(token, JWT_SECRET);
    const { ma_lop } = req.body;

    const [classes] = await pool.query("SELECT * FROM lop_hoc WHERE ma_lop = ?", [ma_lop]);
    if (classes.length === 0) return res.status(404).json({ message: "Mã lớp không tồn tại." });

    const classId = classes[0].id;
    const [exists] = await pool.query("SELECT * FROM thanh_vien_lop WHERE lop_hoc_id = ? AND hoc_vien_id = ?", [classId, decoded.userId]);
    
    if (exists.length > 0) return res.status(409).json({ message: "Đã tham gia hoặc đang chờ duyệt." });

    await pool.query("INSERT INTO thanh_vien_lop (lop_hoc_id, hoc_vien_id, trang_thai) VALUES (?, ?, 'pending')", [classId, decoded.userId]);
    res.status(200).json({ message: `Đã gửi yêu cầu vào lớp: ${classes[0].ten_lop}` });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [STUDENT] Lấy danh sách lớp đã tham gia
app.get("/api/student/classes", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const sql = `SELECT l.*, u.ho_ten as giao_vien, tv.trang_thai FROM thanh_vien_lop tv
                 JOIN lop_hoc l ON tv.lop_hoc_id = l.id
                 JOIN nguoi_dung u ON l.giao_vien_id = u.user_id
                 WHERE tv.hoc_vien_id = ? ORDER BY tv.ngay_tham_gia DESC`;
    const [classes] = await pool.query(sql, [decoded.userId]);
    res.status(200).json(classes || []);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [TEACHER] Duyệt thành viên
app.post("/api/classes/approve", async (req, res) => {
  try {
    const { class_id, student_id, action } = req.body; 
    if (action === 'approve') {
        await pool.query("UPDATE thanh_vien_lop SET trang_thai = 'approved' WHERE lop_hoc_id = ? AND hoc_vien_id = ?", [class_id, student_id]);
    } else {
        await pool.query("DELETE FROM thanh_vien_lop WHERE lop_hoc_id = ? AND hoc_vien_id = ?", [class_id, student_id]);
    }
    res.status(200).json({ message: "Thành công" });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [COMMON] Chi tiết lớp
app.get("/api/classes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT l.*, u.ho_ten as giao_vien FROM lop_hoc l JOIN nguoi_dung u ON l.giao_vien_id = u.user_id WHERE l.id = ?`;
    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy lớp" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [COMMON] Thành viên trong lớp
app.get("/api/classes/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT tv.id, u.user_id, u.ho_ten, u.email, tv.ngay_tham_gia, tv.trang_thai
                 FROM thanh_vien_lop tv JOIN nguoi_dung u ON tv.hoc_vien_id = u.user_id
                 WHERE tv.lop_hoc_id = ? ORDER BY tv.trang_thai DESC`;
    const [members] = await pool.query(sql, [id]);
    res.status(200).json(members);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [COMMON] Lấy bài tập trong lớp
app.get("/api/classes/:id/assignments", async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query("SELECT * FROM bai_tap WHERE lop_hoc_id = ? ORDER BY ngay_tao DESC", [id]);
      res.json(rows);
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [TEACHER] Giao bài tập
app.post("/api/classes/:id/assignments", async (req, res) => {
  try {
    const classId = req.params.id;
    const { tieu_de, mo_ta, han_nop, kieu_nop } = req.body; 
    const sql = "INSERT INTO bai_tap (lop_hoc_id, tieu_de, mo_ta, han_nop, kieu_nop) VALUES (?, ?, ?, ?, ?)";
    await pool.query(sql, [classId, tieu_de, mo_ta, han_nop, kieu_nop]);
    res.status(201).json({ message: "Giao bài thành công!" });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [TEACHER] Cập nhật thông tin lớp (Mô tả)
app.put("/api/classes/:id", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const { mo_ta, ten_lop } = req.body;
    await pool.query("UPDATE lop_hoc SET mo_ta = ?, ten_lop = ? WHERE id = ?", [mo_ta, ten_lop, req.params.id]);
    res.json({ message: "Cập nhật thành công!" });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [COMMON] Lấy danh sách tài liệu của lớp
app.get("/api/classes/:id/documents", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tai_lieu_lop WHERE lop_hoc_id = ? ORDER BY ngay_tao DESC", [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [TEACHER] Thêm tài liệu mới
app.post("/api/classes/:id/documents", async (req, res) => {
  try {
    const { ten_tai_lieu, duong_dan, loai_file } = req.body;
    await pool.query(
      "INSERT INTO tai_lieu_lop (lop_hoc_id, ten_tai_lieu, duong_dan, loai_file) VALUES (?, ?, ?, ?)",
      [req.params.id, ten_tai_lieu, duong_dan, loai_file]
    );
    res.json({ message: "Đã thêm tài liệu!" });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [TEACHER] Xóa tài liệu
app.delete("/api/documents/:docId", async (req, res) => {
  try {
    await pool.query("DELETE FROM tai_lieu_lop WHERE id = ?", [req.params.docId]);
    res.json({ message: "Đã xóa tài liệu" });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [TEACHER] Lấy danh sách bài nộp
app.get("/api/assignments/:id/submissions", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT bn.*, u.ho_ten, u.email FROM bai_nop bn JOIN nguoi_dung u ON bn.user_id = u.user_id
                 WHERE bn.bai_tap_id = ? ORDER BY bn.ngay_nop DESC`;
    const [subs] = await pool.query(sql, [id]);
    res.status(200).json(subs);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [STUDENT/TEACHER] Lấy chi tiết 1 bài tập (Kèm cấu hình)
app.get("/api/assignments/:id", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    // Lấy chi tiết bài tập
    const [rows] = await pool.query("SELECT * FROM bai_tap WHERE id = ?", [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bài tập" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [TEACHER] Chấm điểm bài nộp
app.post("/api/submissions/:id/grade", async (req, res) => {
  try {
    const { id } = req.params;
    const { diem, nhan_xet } = req.body;
    await pool.query("UPDATE bai_nop SET diem = ?, nhan_xet = ?, trang_thai_cham = 'da_cham' WHERE bai_nop_id = ?", [diem, nhan_xet, id]);
    res.status(200).json({ message: "Đã chấm!" });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [STUDENT] 
app.get("/api/assignments/:id/my-submission", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const { id } = req.params; 
    const sql = `SELECT * FROM bai_nop WHERE bai_tap_id = ? AND user_id = ?`;
    const [rows] = await pool.query(sql, [id, decoded.userId]);
    
    res.json(rows[0] || null); 
  } catch (err) { console.error(err); res.status(500).json({ message: "Lỗi server" }); }
});

// [STUDENT] Nộp bài tập
app.post("/api/assignments/:id/submit", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const baiTapId = req.params.id;
    const { link_nop_bai } = req.body; 

    console.log("Submit Info:", { userId: decoded.userId, baiTapId, link: link_nop_bai });

    // 1. Kiểm tra xem đã nộp chưa
    const [check] = await pool.query(
      "SELECT bai_nop_id FROM bai_nop WHERE bai_tap_id = ? AND user_id = ?", 
      [baiTapId, decoded.userId]
    );

    if (check.length > 0) {
        // 2. Nếu có rồi -> UPDATE
        await pool.query(
          "UPDATE bai_nop SET link_nop_bai = ?, ngay_nop = NOW() WHERE bai_nop_id = ?", 
          [link_nop_bai, check[0].bai_nop_id]
        );
        res.json({ message: "Cập nhật bài nộp thành công!" });
    } else {
        // 3. Nếu chưa -> INSERT
        await pool.query(
            "INSERT INTO bai_nop (bai_tap_id, user_id, link_nop_bai, ngay_nop, trang_thai_cham) VALUES (?, ?, ?, NOW(), 'chua_cham')",
            [baiTapId, decoded.userId, link_nop_bai]
        );
        res.json({ message: "Nộp bài thành công!" });
    }
  } catch (err) {
    console.error("SQL Error chi tiết:", err); 
    res.status(500).json({ message: "Lỗi Server: " + (err.sqlMessage || err.message) });
  }
});


// ============================================================
// 4. PUBLIC PRACTICE APIs (Luyện thi tự do)
// ============================================================

app.get("/api/slideshow", async (req, res) => {
  try {
    const [slides] = await pool.query("SELECT * FROM slideshow ORDER BY thu_tu ASC");
    res.status(200).json(slides);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// ===================================
// LISTENING APIS (Đã cập nhật)
// ===================================

app.get("/api/listening/test", async (req, res) => {
  try {
    const { level, topic, id } = req.query;
    let sql = "";
    let params = [];

    if (id) {
      // TRƯỜNG HỢP 1: Lấy đề cụ thể theo ID
      sql = "SELECT * FROM listening_audios WHERE id = ?";
      params = [id];
    } else {
      // TRƯỜNG HỢP 2: Lấy ngẫu nhiên
      sql = "SELECT * FROM listening_audios WHERE level_id = ? AND topic_id = ? ORDER BY RAND() LIMIT 1";
      params = [level, topic];
    }

    const [audios] = await pool.query(sql, params);
    
    // Fallback: Nếu không tìm thấy, lấy ngẫu nhiên 1 bài
    if (audios.length === 0 && !id) {
       const [rand] = await pool.query("SELECT * FROM listening_audios ORDER BY RAND() LIMIT 1");
       if (rand.length > 0) audios.push(rand[0]);
    }

    if (audios.length === 0) return res.status(404).json({ message: "Chưa có bài nghe." });
    
    const audio = audios[0];
    const [questions] = await pool.query("SELECT * FROM listening_questions WHERE audio_id = ?", [audio.id]);
    
    const formatted = questions.map(q => ({
      id: q.id, question: q.question_text,
      options: [`A. ${q.option_a}`, `B. ${q.option_b}`, `C. ${q.option_c}`, `D. ${q.option_d}`],
      correct: q.correct_answer, explanation: q.explanation
    }));
    
    res.status(200).json({ ...audio, questions: formatted });

  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

app.get("/api/listening/list", async (req, res) => {
  try {
    const { level, topic } = req.query;
    const sql = "SELECT id, title, duration FROM listening_audios WHERE level_id = ? AND topic_id = ?";
    const [rows] = await pool.query(sql, [level, topic]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

app.get("/api/listening/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json([]);
    const decoded = jwt.verify(token, JWT_SECRET);

    const sql = `SELECT id, diem_so, thoi_gian_lam, ngay_lam, tieu_de_bai_thi FROM lich_su_lam_bai WHERE user_id = ? AND ky_nang = 'listening' ORDER BY ngay_lam DESC LIMIT 10`;
    const [rows] = await pool.query(sql, [decoded.userId]);
    
    const formatted = rows.map(r => ({
      ...r,
      ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(r.ngay_lam).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
    }));
    
    res.json(formatted);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// ===================================
// READING APIS
// ===================================

app.get("/api/reading/list", async (req, res) => {
  try {
    const { level, topic } = req.query;
    const sql = "SELECT id, title FROM reading_passages WHERE level_id = ? AND topic_id = ?";
    const [rows] = await pool.query(sql, [level, topic]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

app.get("/api/reading/test", async (req, res) => {
  try {
    const { level, topic, id } = req.query;
    let sql = "";
    let params = [];

    if (id) {
        sql = "SELECT * FROM reading_passages WHERE id = ?";
        params = [id];
    } else {
        sql = "SELECT * FROM reading_passages WHERE level_id = ? AND topic_id = ? ORDER BY RAND() LIMIT 1";
        params = [level, topic];
    }

    const [passages] = await pool.query(sql, params);
    
    if (passages.length === 0 && !id) {
        const [rand] = await pool.query("SELECT * FROM reading_passages ORDER BY RAND() LIMIT 1");
        if(rand.length > 0) passages.push(rand[0]);
    }

    if (passages.length === 0) return res.status(404).json({ message: "Chưa có bài đọc." });

    const passage = passages[0];
    const [questions] = await pool.query("SELECT * FROM reading_questions WHERE passage_id = ?", [passage.id]);
    
    const formatted = questions.map(q => ({
      id: q.id, question: q.question_text,
      options: [`A. ${q.option_a}`, `B. ${q.option_b}`, `C. ${q.option_c}`, `D. ${q.option_d}`],
      correct: q.correct_answer, explanation: q.explanation
    }));
    res.status(200).json({ ...passage, questions: formatted });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

app.get("/api/reading/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json([]);
    const decoded = jwt.verify(token, JWT_SECRET);

    const sql = `SELECT id, diem_so, thoi_gian_lam, ngay_lam, tieu_de_bai_thi FROM lich_su_lam_bai WHERE user_id = ? AND ky_nang = 'reading' ORDER BY ngay_lam DESC LIMIT 10`;
    const [rows] = await pool.query(sql, [decoded.userId]);
    
    const formatted = rows.map(r => ({
      ...r,
      ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(r.ngay_lam).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
    }));
    
    res.json(formatted);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// ===================================
// WRITING APIS (MỚI NÂNG CẤP)
// ===================================

// 1. Lấy danh sách đề Writing theo Task & Topic (Cho Dashboard)
app.get("/api/writing/list", async (req, res) => {
  try {
    const { level, topic, task } = req.query;
    
    let sql = "SELECT id, title, task_type FROM writing_prompts WHERE level_id = ? AND topic_id = ?";
    let params = [level, topic];

    if (task && task !== 'all') {
        sql += " AND task_type = ?";
        params.push(task);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// 2. Lấy chi tiết đề Writing (Hỗ trợ ID)
app.get("/api/writing/test", async (req, res) => {
    try {
        const { id } = req.query; // Ưu tiên lấy theo ID
        
        let sql = "SELECT * FROM writing_prompts WHERE id = ?";
        let params = [id];

        // Nếu không có ID, fallback lấy random (để giữ code cũ chạy)
        if (!id) {
            sql = "SELECT * FROM writing_prompts ORDER BY RAND() LIMIT 1";
            params = [];
        }
        
        const [prompts] = await pool.query(sql, params);
        if (prompts.length === 0) return res.status(404).json({ message: "Không tìm thấy đề bài." });
        
        res.status(200).json(prompts[0]);
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// 3. Lấy lịch sử Writing
app.get("/api/writing/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json([]);
    const decoded = jwt.verify(token, JWT_SECRET);

    const sql = `
      SELECT id, diem_so, thoi_gian_lam, ngay_lam, tieu_de_bai_thi, bai_lam_text, ai_feedback
      FROM lich_su_lam_bai 
      WHERE user_id = ? AND ky_nang = 'writing' 
      ORDER BY ngay_lam DESC LIMIT 10`;
      
    const [rows] = await pool.query(sql, [decoded.userId]);
    
    const formatted = rows.map(r => ({
      ...r,
      ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(r.ngay_lam).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
    }));
    
    res.json(formatted);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// ===================================
// SPEAKING APIS (MỚI BỔ SUNG)
// ===================================

// 1. Lấy danh sách câu hỏi Speaking (Sửa lỗi 404)
app.get("/api/speaking/list", async (req, res) => {
  try {
    const { part, topic } = req.query;
    let sql = "SELECT id, title, part FROM speaking_questions WHERE 1=1";
    let params = [];
    if (part) { sql += " AND part = ?"; params.push(part); }
    if (topic && topic !== 'all') { sql += " AND topic_id = ?"; params.push(topic); }
    
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// 2. Lấy chi tiết đề Speaking
app.get("/api/speaking/test", async (req, res) => {
  try {
    const { id, part } = req.query; // Thêm part để fallback
    let sql = "";
    let params = [];

    if (id) {
        sql = "SELECT * FROM speaking_questions WHERE id = ?";
        params = [id];
    } else {
        // Fallback: Lấy ngẫu nhiên theo part
        sql = "SELECT * FROM speaking_questions WHERE part = ? ORDER BY RAND() LIMIT 1";
        params = [part || 1];
    }
    
    const [rows] = await pool.query(sql, params);
    if(rows.length === 0) return res.status(404).json({ message: "Không tìm thấy đề nói." });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// 3. Lấy lịch sử Speaking (Sửa lỗi 404)
app.get("/api/speaking/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1]; if(!token) return res.json([]);
    const decoded = jwt.verify(token, JWT_SECRET);
    const sql = `SELECT id, diem_so, thoi_gian_lam, ngay_lam, tieu_de_bai_thi, bai_lam_text, ai_feedback FROM lich_su_lam_bai WHERE user_id = ? AND ky_nang = 'speaking' ORDER BY ngay_lam DESC LIMIT 10`;
    const [rows] = await pool.query(sql, [decoded.userId]);
    res.json(rows.map(r => ({...r, ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN')})));
  } catch (err) { res.status(500).json({ message: "Err" }); }
});

// ============================================================
// 5. AI INTEGRATION (GROQ - LLAMA 3.3)
// ============================================================

// Helper: Gọi Groq AI
async function callGemini(prompt) {
  const key = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY; 
  
  if (!key) {
      console.error("❌ Thiếu GROQ_API_KEY trong file .env");
      return { 
          word: "Lỗi Config", 
          meaning_vi: "Chưa cấu hình Key Groq", 
          description: "Vui lòng kiểm tra file .env", 
          examples: [] 
      };
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({ 
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: "You are a helpful JSON assistant. You must output valid JSON only. No markdown." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" } 
      })
    });

    if (!response.ok) {
       const errData = await response.json();
       console.error("❌ Groq API Error:", JSON.stringify(errData, null, 2));
       throw new Error("Lỗi kết nối AI (Groq)");
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "{}";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);

  } catch (error) {
    console.error("❌ AI Crash:", error.message);
    return { word: "Error", meaning_vi: "Hệ thống đang bận", description: "Vui lòng thử lại sau.", examples: [] };
  }
}

// API: Chấm điểm Speaking (Dựa trên văn bản Speech-to-Text)
app.post("/api/speaking/grade", async (req, res) => {
  try {
    const { topic, transcript, part } = req.body; 
    if (!transcript || transcript.length < 5) return res.status(400).json({ message: "Chưa nghe rõ." });
    const prompt = `Act as VSTEP Examiner. Grade Speaking Part ${part}. Q: "${topic}". Ans: "${transcript}". Return JSON: { "score": number(0-10), "comment": "Vietnamese", "better_response": "English", "vocabulary_suggestions": ["words"] }`;
    const result = await callGemini(prompt);
    res.status(200).json(result);
  } catch (err) { res.status(500).json({ message: "Lỗi AI." }); }
});

// API: Chấm điểm Writing (AI)
app.post("/api/writing/grade", async (req, res) => {
  try {
    const { topic, essay, level } = req.body;
    if (!essay || essay.length < 10) return res.status(400).json({ message: "Bài viết quá ngắn." });

    console.log("🤖 AI Grading (Groq)...");
    const prompt = `Act as VSTEP Examiner. Grade this essay for Level ${level}. 
    Topic: "${topic}". 
    Essay: "${essay}". 
    
    Return JSON ONLY: { 
        "score": number (0-10), 
        "comment": "General feedback (Vietnamese)", 
        "corrections": ["list of specific errors and fixes"], 
        "suggestion": "How to improve (Vietnamese)" 
    }`;
    
    const result = await callGemini(prompt);
    res.status(200).json(result);

  } catch (err) { 
    console.error("AI Error:", err.message);
    res.status(500).json({ message: "Lỗi chấm điểm.", detail: err.message }); 
  }
});

// API: Tra từ điển (AI)
app.post("/api/dictionary/lookup", async (req, res) => {
  try {
    const { word } = req.body;
    const prompt = `Dictionary lookup for "${word}". Return JSON ONLY: { "word": "${word}", "phonetic": "string", "type": "string", "meaning_vi": "string (vietnamese)", "description": "string (english definition)", "examples": [{"en": "string", "vi": "string"}], "synonyms": ["string"] }`;
    
    const result = await callGemini(prompt);
    res.status(200).json(result);
  } catch (err) { 
    res.status(500).json({ message: "Lỗi tra từ." }); 
  }
});

// API: Giải thích câu hỏi (AI) - CÓ CONTEXT
app.post("/api/ai/explain", async (req, res) => {
  try {
    const { question, options, correct, userAnswer, context } = req.body;
    
    const prompt = `
      Bạn là giáo viên VSTEP. Dựa vào nội dung bài đọc dưới đây để giải thích câu hỏi:
      --- CONTEXT ---
      "${context || 'Không có bài đọc'}"
      ---------------
      Giải thích câu hỏi này cho người Việt:
      - Câu hỏi: "${question}"
      - Các lựa chọn: ${JSON.stringify(options)}
      - Đáp án đúng: ${correct}
      
      Trả về JSON: { "translation": "Dịch câu hỏi/đáp án", "explanation": "Giải thích chi tiết dựa trên bài đọc", "key_vocabulary": ["từ vựng: nghĩa"] }
    `;
    
    const result = await callGemini(prompt);
    res.status(200).json(result);
  } catch (err) { 
    res.status(500).json({ message: "Lỗi AI Explain." }); 
  }
});

// ============================================================
// 6. USER HISTORY & RESULTS (CẬP NHẬT LƯU BÀI VIẾT)
// ============================================================

app.post("/api/results", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET); 
    
    // Nhận thêm bai_lam_text và ai_feedback
    const { skill, level, score, duration, testTitle, bai_lam_text, ai_feedback } = req.body; 

    const sql = `INSERT INTO lich_su_lam_bai 
        (user_id, ky_nang, trinh_do, diem_so, thoi_gian_lam, tieu_de_bai_thi, bai_lam_text, ai_feedback, ngay_lam) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    
    // Lưu các trường mới vào DB (nếu là null thì DB tự hiểu)
    await pool.query(sql, [
        decoded.userId, skill, level, score, duration, 
        testTitle || 'Bài luyện tập', 
        bai_lam_text || null, 
        ai_feedback ? JSON.stringify(ai_feedback) : null // Lưu JSON dưới dạng string
    ]);

    res.status(201).json({ message: "Saved!" });
  } catch (err) { 
      console.error(err);
      res.status(500).json({ message: "Lỗi lưu điểm." }); 
  }
});

app.get("/api/results/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET); 
    
    const sql = "SELECT * FROM lich_su_lam_bai WHERE user_id = ? ORDER BY ngay_lam DESC LIMIT 20";
    const [history] = await pool.query(sql, [decoded.userId]);
    
    const formatted = history.map(h => ({
      ...h,
      date: new Date(h.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(h.ngay_lam).toLocaleTimeString('vi-VN')
    }));
    res.status(200).json(formatted);
  } catch (err) { res.status(500).json({ message: "Lỗi server." }); }
});

// ============================================================
// 7. DASHBOARD & STATISTICS
// ============================================================

app.get("/api/dashboard/stats", async (req, res) => {
   try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const roleId = decoded.vaiTroId; 

   let stats = {
      totalClasses: 0, totalStudents: 0, pendingStudents: 0,
      totalAssignments: 0, upcomingDeadlines: [], totalTeachers: 0, recentUsers: []
    };

     if (roleId === 2) { 
       const [classes] = await pool.query("SELECT COUNT(*) as count FROM lop_hoc WHERE giao_vien_id = ?", [userId]);
       stats.totalClasses = classes[0].count;

      const [students] = await pool.query(`SELECT COUNT(*) as count FROM thanh_vien_lop tv JOIN lop_hoc lh ON tv.lop_hoc_id = lh.id WHERE lh.giao_vien_id = ? AND tv.trang_thai = 'approved'`, [userId]);
      stats.totalStudents = students[0].count;

      const [pending] = await pool.query(`SELECT COUNT(*) as count FROM thanh_vien_lop tv JOIN lop_hoc lh ON tv.lop_hoc_id = lh.id WHERE lh.giao_vien_id = ? AND tv.trang_thai = 'pending'`, [userId]);
      stats.pendingStudents = pending[0].count;

      const [assigns] = await pool.query(`SELECT COUNT(*) as count FROM bai_tap bt JOIN lop_hoc lh ON bt.lop_hoc_id = lh.id WHERE lh.giao_vien_id = ?`, [userId]);
      stats.totalAssignments = assigns[0].count;

      const [deadlines] = await pool.query(`SELECT bt.id, bt.tieu_de, bt.han_nop, lh.ma_lop FROM bai_tap bt JOIN lop_hoc lh ON bt.lop_hoc_id = lh.id WHERE lh.giao_vien_id = ? AND bt.han_nop >= CURDATE() ORDER BY bt.han_nop ASC LIMIT 5`, [userId]);
      stats.upcomingDeadlines = deadlines;

    } else if (roleId === 3) { // ADMIN
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
    console.error(err);
      res.status(500).json({ message: "Lỗi lấy thống kê" });
 }
});
// ============================================================
// 8. PROFILE & USER STATS (MỚI THÊM)
// ============================================================

// API: Lấy thống kê chi tiết cho trang Profile
app.get("/api/profile/stats", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // 1. Lấy thông tin User cơ bản
    const [users] = await pool.query("SELECT ho_ten, email, ngay_tao FROM nguoi_dung WHERE user_id = ?", [userId]);
    const user = users[0];

    // 2. Tính toán thống kê từ lịch sử làm bài
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
    
    // 3. Lấy 5 bài làm gần nhất
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
          ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN')
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy Profile" });
  }
});
// ============================================================
// 9. TEACHER UPGRADE REQUESTS (NÂNG CẤP GIÁO VIÊN)
// ============================================================

// [USER] Gửi yêu cầu nâng cấp
app.post("/api/teacher-request", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const { so_dien_thoai, trinh_do, kinh_nghiem, link_cv } = req.body;

    // Kiểm tra xem đã có yêu cầu đang chờ chưa
    const [exists] = await pool.query("SELECT * FROM yeu_cau_nang_cap WHERE user_id = ? AND trang_thai = 'pending'", [decoded.userId]);
    if (exists.length > 0) return res.status(400).json({ message: "Bạn đã gửi yêu cầu rồi, vui lòng chờ duyệt." });

    await pool.query(
      "INSERT INTO yeu_cau_nang_cap (user_id, so_dien_thoai, trinh_do, kinh_nghiem, link_cv) VALUES (?, ?, ?, ?, ?)",
      [decoded.userId, so_dien_thoai, trinh_do, kinh_nghiem, link_cv]
    );

    res.json({ message: "Gửi yêu cầu thành công! Admin sẽ xét duyệt sớm." });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [ADMIN] Lấy danh sách yêu cầu
app.get("/api/admin/teacher-requests", async (req, res) => {
  try {
    // (Thực tế nên check quyền Admin ở đây)
    const sql = `
      SELECT y.*, u.ho_ten, u.email 
      FROM yeu_cau_nang_cap y
      JOIN nguoi_dung u ON y.user_id = u.user_id
      WHERE y.trang_thai = 'pending'
      ORDER BY y.ngay_tao DESC
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// [ADMIN] Duyệt hoặc Từ chối
app.post("/api/admin/teacher-requests/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const { action } = req.body; // 'approve' hoặc 'reject'

    // Lấy thông tin request
    const [reqs] = await pool.query("SELECT * FROM yeu_cau_nang_cap WHERE id = ?", [requestId]);
    if (reqs.length === 0) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    const request = reqs[0];

    if (action === 'approve') {
      // 1. Cập nhật trạng thái request
      await pool.query("UPDATE yeu_cau_nang_cap SET trang_thai = 'approved' WHERE id = ?", [requestId]);
      // 2. Nâng cấp user lên Giáo viên (vai_tro_id = 2)
      await pool.query("UPDATE nguoi_dung SET vai_tro_id = 2 WHERE user_id = ?", [request.user_id]);
      res.json({ message: "Đã duyệt thành công!" });
    } else {
      // Từ chối
      await pool.query("UPDATE yeu_cau_nang_cap SET trang_thai = 'rejected' WHERE id = ?", [requestId]);
      res.json({ message: "Đã từ chối yêu cầu." });
    }
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});
// ============================================================
// 10. CLASS DISCUSSION (DIỄN ĐÀN LỚP HỌC)
// ============================================================

// Lấy danh sách tin nhắn của một lớp
app.get("/api/classes/:id/discussions", async (req, res) => {
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
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// Gửi tin nhắn mới vào lớp
app.post("/api/classes/:id/discussions", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const { id } = req.params; // lop_hoc_id
    const { noi_dung } = req.body;

    await pool.query(
      "INSERT INTO lop_hoc_thao_luan (lop_hoc_id, user_id, noi_dung) VALUES (?, ?, ?)",
      [id, decoded.userId, noi_dung]
    );

    res.status(201).json({ message: "Đã gửi tin nhắn" });
  } catch (err) { res.status(500).json({ message: "Lỗi gửi tin" }); }
});
// KHỞI ĐỘNG SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại: http://localhost:${PORT}`));