import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 
import path from 'path'; 
import { fileURLToPath } from 'url';

// Import Google AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CẤU HÌNH ---
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); 

// Khởi tạo AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- KẾT NỐI DATABASE ---
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
    console.log("✅ Đã kết nối Database!");
    connection.release(); 
  })
  .catch(err => console.error("❌ Lỗi kết nối DB:", err.message));

app.get("/", (req, res) => res.send("✅ VSTEP Backend Running"));

// ==========================================
// 1. AUTHENTICATION (Đăng nhập/Đăng ký)
// ==========================================

app.post("/api/login", async (req, res) => {
  try {
    const { email, mat_khau } = req.body;
    const [results] = await pool.query("SELECT * FROM nguoi_dung WHERE email = ?", [email]);

    if (results.length === 0) return res.status(404).json({ message: "Email không tồn tại" });

    const user = results[0];
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { userId: user.user_id, vaiTroId: user.vai_tro_id },
      process.env.JWT_SECRET || "BI_MAT_CUA_BAN",
      { expiresIn: "1h" }
    );
    
    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: { id: user.user_id, hoTen: user.ho_ten, email: user.email, vaiTroId: user.vai_tro_id }
    });

  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

app.post("/api/register", async (req, res) => {
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
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// ==========================================
// 2. ADMIN APIs (QUẢN LÝ NGƯỜI DÙNG) - MỚI
// ==========================================

// Lấy danh sách tất cả người dùng (Chỉ Admin)
app.get("/api/users", async (req, res) => {
  try {
    // Lấy 50 user mới nhất, kèm tên vai trò
    const sql = `
      SELECT u.user_id, u.ho_ten, u.email, u.vai_tro_id, u.ngay_tao, v.ten_vai_tro
      FROM nguoi_dung u
      LEFT JOIN vai_tro v ON u.vai_tro_id = v.vai_tro_id
      ORDER BY u.user_id DESC LIMIT 50
    `;
    const [users] = await pool.query(sql);
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy danh sách user" });
  }
});

// Cập nhật vai trò (Role)
app.put("/api/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { vaiTroId } = req.body; // 1: Student, 2: Teacher, 3: Admin
    
    await pool.query("UPDATE nguoi_dung SET vai_tro_id = ? WHERE user_id = ?", [vaiTroId, id]);
    res.status(200).json({ message: "Cập nhật quyền thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật" });
  }
});

// Xóa người dùng
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM nguoi_dung WHERE user_id = ?", [id]);
    res.status(200).json({ message: "Đã xóa người dùng." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa người dùng" });
  }
});

// ==========================================
// 3. LUYỆN THI & AI APIs (Giữ nguyên)
// ==========================================

app.get("/api/slideshow", async (req, res) => {
  try {
    const [slides] = await pool.query("SELECT * FROM slideshow ORDER BY thu_tu ASC");
    res.status(200).json(slides);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

app.get("/api/reading/test", async (req, res) => {
  try {
    const { level, topic } = req.query;
    const [passages] = await pool.query("SELECT * FROM reading_passages WHERE level_id = ? AND topic_id = ? ORDER BY RAND() LIMIT 1", [level, topic]);

    if (passages.length === 0) return res.status(404).json({ message: "Chưa có bài đọc." });

    const passage = passages[0];
    const [questions] = await pool.query("SELECT * FROM reading_questions WHERE passage_id = ?", [passage.id]);

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question_text,
      options: [`A. ${q.option_a}`, `B. ${q.option_b}`, `C. ${q.option_c}`, `D. ${q.option_d}`],
      correct: q.correct_answer,
      explanation: q.explanation
    }));

    res.status(200).json({ id: passage.id, title: passage.title, content: passage.content, questions: formattedQuestions });
  } catch (err) { res.status(500).json({ message: "Lỗi máy chủ." }); }
});

app.get("/api/listening/test", async (req, res) => {
  try {
    const { level, topic } = req.query;
    let query = "SELECT * FROM listening_audios WHERE level_id = ? AND topic_id = ? ORDER BY RAND() LIMIT 1";
    let params = [level, topic];
    const [check] = await pool.query(query, params);
    if (check.length === 0) { query = "SELECT * FROM listening_audios ORDER BY RAND() LIMIT 1"; params = []; }
    const [audios] = await pool.query(query, params);
    if (audios.length === 0) return res.status(404).json({ message: "Chưa có bài nghe." });
    const audio = audios[0];
    const [questions] = await pool.query("SELECT * FROM listening_questions WHERE audio_id = ?", [audio.id]);
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question_text,
      options: [`A. ${q.option_a}`, `B. ${q.option_b}`, `C. ${q.option_c}`, `D. ${q.option_d}`],
      correct: q.correct_answer,
      explanation: q.explanation
    }));
    res.status(200).json({ id: audio.id, title: audio.title, audio_url: audio.audio_url, part: audio.part, questions: formattedQuestions });
  } catch (err) { res.status(500).json({ message: "Lỗi máy chủ." }); }
});

app.get("/api/speaking/test", async (req, res) => {
  try {
    const { part, topic } = req.query;
    let sql = "SELECT * FROM speaking_questions WHERE 1=1";
    let params = [];
    if (part) { sql += " AND part = ?"; params.push(part); }
    sql += " ORDER BY RAND() LIMIT 1";
    const [questions] = await pool.query(sql, params);
    if (questions.length === 0) {
       const [rand] = await pool.query("SELECT * FROM speaking_questions ORDER BY RAND() LIMIT 1");
       return res.status(200).json(rand[0]);
    }
    res.status(200).json(questions[0]);
  } catch (err) { res.status(500).json({ message: "Lỗi máy chủ." }); }
});

app.get("/api/writing/test", async (req, res) => {
  try {
    const { level, topic, task } = req.query;
    let sql = "SELECT * FROM writing_prompts WHERE level_id = ? AND topic_id = ?";
    let params = [level, topic];
    if (task) { sql += " AND task_type = ?"; params.push(task); }
    sql += " ORDER BY RAND() LIMIT 1";
    const [prompts] = await pool.query(sql, params);
    if (prompts.length === 0) {
        const [rand] = await pool.query("SELECT * FROM writing_prompts ORDER BY RAND() LIMIT 1");
        return res.status(200).json(rand[0]);
    }
    res.status(200).json(prompts[0]);
  } catch (err) { res.status(500).json({ message: "Lỗi máy chủ" }); }
});

// Chấm điểm Writing (REST API)
app.post("/api/writing/grade", async (req, res) => {
  try {
    const { topic, essay, level } = req.body;
    if (!essay || essay.length < 10) return res.status(400).json({ message: "Bài viết quá ngắn." });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "Chưa có API Key." });

    console.log("🤖 Đang chấm bài...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const prompt = `Act as VSTEP Examiner. Grade based on level ${level}. Topic: ${topic}. Essay: "${essay}". Return JSON: { "score": "...", "comment": "...", "corrections": [], "suggestion": "..." }`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error("Google API Error");
    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    if (text.indexOf('{') > -1) text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);

    res.status(200).json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ message: "Lỗi chấm điểm.", detail: err.message });
  }
});

// Tra từ điển (REST API)
app.post("/api/dictionary/lookup", async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) return res.status(400).json({ message: "Chưa nhập từ." });
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const prompt = `Dictionary lookup for "${word}". Return JSON: { "word": "${word}", "phonetic": "...", "type": "...", "meaning_vi": "...", "description": "...", "examples": [{"en": "...", "vi": "..."}], "synonyms": [] }`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    if (text.indexOf('{') > -1) text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    res.status(200).json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ message: "Lỗi tra từ." });
  }
});

// Lưu kết quả thi
app.post("/api/results", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "BI_MAT_CUA_BAN");
    const { skill, level, score, duration } = req.body; 

    const sql = "INSERT INTO lich_su_lam_bai (user_id, ky_nang, trinh_do, diem_so, thoi_gian_lam) VALUES (?, ?, ?, ?, ?)";
    await pool.query(sql, [decoded.userId, skill, level, score, duration]);
    res.status(201).json({ message: "Saved!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lưu điểm." });
  }
});

// Lấy lịch sử thi
app.get("/api/results/history", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "BI_MAT_CUA_BAN");
    
    const sql = "SELECT * FROM lich_su_lam_bai WHERE user_id = ? ORDER BY ngay_lam DESC LIMIT 20";
    const [history] = await pool.query(sql, [decoded.userId]);

    const formatted = history.map(h => ({
      ...h,
      date: new Date(h.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(h.ngay_lam).toLocaleTimeString('vi-VN')
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy lịch sử." });
  }
});
// ============================================================
// 5. CLASSROOM APIs (Quản lý Lớp học)
// ============================================================

// [TEACHER] Tạo lớp học mới
app.post("/api/classes", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "BI_MAT_CUA_BAN");
    // Kiểm tra quyền Giáo viên (Role 2) hoặc Admin (Role 3)
    if (decoded.vaiTroId !== 2 && decoded.vaiTroId !== 3) {
       return res.status(403).json({ message: "Chỉ giáo viên mới được tạo lớp." });
    }

    const { ten_lop, mo_ta } = req.body;
    
    // Tự động sinh Mã lớp (VD: VS + 4 số ngẫu nhiên)
    const ma_lop = "VS" + Math.floor(1000 + Math.random() * 9000);

    const sql = "INSERT INTO lop_hoc (ten_lop, ma_lop, giao_vien_id, mo_ta) VALUES (?, ?, ?, ?)";
    await pool.query(sql, [ten_lop, ma_lop, decoded.userId, mo_ta]);

    res.status(201).json({ message: "Tạo lớp thành công!", ma_lop });
  } catch (err) {
    console.error("Create Class Error:", err);
    res.status(500).json({ message: "Lỗi khi tạo lớp." });
  }
});

// [TEACHER] Lấy danh sách lớp do mình tạo
app.get("/api/teacher/classes", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "BI_MAT_CUA_BAN");
    
    // Đếm số học viên trong mỗi lớp luôn
    const sql = `
      SELECT l.*, COUNT(tv.id) as so_hoc_vien 
      FROM lop_hoc l 
      LEFT JOIN thanh_vien_lop tv ON l.id = tv.lop_hoc_id 
      WHERE l.giao_vien_id = ? 
      GROUP BY l.id ORDER BY l.ngay_tao DESC`;
      
    const [classes] = await pool.query(sql, [decoded.userId]);
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server." });
  }
});

// [STUDENT] Tham gia lớp bằng mã (Join Class)
app.post("/api/classes/join", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "BI_MAT_CUA_BAN");
    const { ma_lop } = req.body;

    // 1. Tìm lớp
    const [classes] = await pool.query("SELECT * FROM lop_hoc WHERE ma_lop = ?", [ma_lop]);
    if (classes.length === 0) return res.status(404).json({ message: "Mã lớp không tồn tại." });

    const classId = classes[0].id;

    // 2. Kiểm tra đã tham gia chưa
    const [exists] = await pool.query("SELECT * FROM thanh_vien_lop WHERE lop_hoc_id = ? AND hoc_vien_id = ?", [classId, decoded.userId]);
    
    if (exists.length > 0) {
        if (exists[0].trang_thai === 'pending') {
            return res.status(409).json({ message: "Bạn đã gửi yêu cầu rồi. Vui lòng chờ giáo viên duyệt." });
        }
        return res.status(409).json({ message: "Bạn đã ở trong lớp này rồi." });
    }

    // 3. Thêm vào lớp với trạng thái 'pending' (Chờ duyệt)
    await pool.query("INSERT INTO thanh_vien_lop (lop_hoc_id, hoc_vien_id, trang_thai) VALUES (?, ?, 'pending')", [classId, decoded.userId]);

    res.status(200).json({ message: `Đã gửi yêu cầu tham gia lớp: ${classes[0].ten_lop}. Vui lòng chờ duyệt.` });

  } catch (err) {
    console.error("Join Class Error:", err);
    res.status(500).json({ message: "Lỗi server." });
  }
});

// [STUDENT] Lấy danh sách lớp (SỬA LẠI: Lấy cả trạng thái để hiển thị)
app.get("/api/student/classes", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "BI_MAT_CUA_BAN");

    const sql = `
      SELECT l.*, u.ho_ten as giao_vien, tv.trang_thai 
      FROM thanh_vien_lop tv
      JOIN lop_hoc l ON tv.lop_hoc_id = l.id
      JOIN nguoi_dung u ON l.giao_vien_id = u.user_id
      WHERE tv.hoc_vien_id = ?
      ORDER BY tv.ngay_tham_gia DESC`;

    const [classes] = await pool.query(sql, [decoded.userId]);
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server." });
  }
});

// [TEACHER] Duyệt học viên vào lớp (MỚI)
app.post("/api/classes/approve", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const { class_id, student_id, action } = req.body; // action: 'approve' hoặc 'reject'

    if (action === 'approve') {
        await pool.query("UPDATE thanh_vien_lop SET trang_thai = 'approved' WHERE lop_hoc_id = ? AND hoc_vien_id = ?", [class_id, student_id]);
        res.status(200).json({ message: "Đã duyệt học viên!" });
    } else {
        await pool.query("DELETE FROM thanh_vien_lop WHERE lop_hoc_id = ? AND hoc_vien_id = ?", [class_id, student_id]);
        res.status(200).json({ message: "Đã từ chối yêu cầu." });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi server." });
  }
});
// [COMMON] Lấy chi tiết một lớp học
app.get("/api/classes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT l.*, u.ho_ten as giao_vien, u.email as email_gv
      FROM lop_hoc l
      JOIN nguoi_dung u ON l.giao_vien_id = u.user_id
      WHERE l.id = ?`;
    const [rows] = await pool.query(sql, [id]);
    
    if (rows.length === 0) return res.status(404).json({ message: "Lớp không tồn tại" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [COMMON] Lấy danh sách bài tập của lớp
app.get("/api/classes/:id/assignments", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM bai_tap WHERE lop_hoc_id = ? ORDER BY ngay_tao DESC", [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});
// [TEACHER] Lấy danh sách thành viên của 1 lớp
app.get("/api/classes/:id/members", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const { id } = req.params; // ID của lớp học

    // Lấy thông tin: ID, Tên, Email, Ngày tham gia, Trạng thái
    const sql = `
      SELECT tv.id, u.user_id, u.ho_ten, u.email, tv.ngay_tham_gia, tv.trang_thai
      FROM thanh_vien_lop tv
      JOIN nguoi_dung u ON tv.hoc_vien_id = u.user_id
      WHERE tv.lop_hoc_id = ?
      ORDER BY tv.trang_thai DESC, tv.ngay_tham_gia DESC
    `;
    // ORDER BY trang_thai DESC để đưa 'pending' lên đầu (nếu pending > approved theo alphabet, 
    // hoặc ta có thể chỉnh lại logic sort ở frontend)

    const [members] = await pool.query(sql, [id]);
    res.status(200).json(members);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server." });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));