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
// Đặt lên đầu để ưu tiên xử lý file
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

// [TEACHER] Tạo lớp
app.post("/api/classes", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.vaiTroId !== 2 && decoded.vaiTroId !== 3) return res.status(403).json({ message: "Forbidden" });

    const { ten_lop, mo_ta } = req.body;
    const ma_lop = "VS" + Math.floor(1000 + Math.random() * 9000);
    
    await pool.query("INSERT INTO lop_hoc (ten_lop, ma_lop, giao_vien_id, mo_ta) VALUES (?, ?, ?, ?)", 
      [ten_lop, ma_lop, decoded.userId, mo_ta]);
    
    res.status(201).json({ message: "Tạo lớp thành công!", ma_lop });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
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

// [TEACHER] Chấm điểm bài nộp
app.post("/api/submissions/:id/grade", async (req, res) => {
  try {
    const { id } = req.params;
    const { diem, nhan_xet } = req.body;
    await pool.query("UPDATE bai_nop SET diem = ?, nhan_xet = ?, trang_thai_cham = 'da_cham' WHERE bai_nop_id = ?", [diem, nhan_xet, id]);
    res.status(200).json({ message: "Đã chấm!" });
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
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

app.get("/api/reading/test", async (req, res) => {
  try {
    const { level, topic } = req.query;
    const [passages] = await pool.query("SELECT * FROM reading_passages WHERE level_id = ? AND topic_id = ? ORDER BY RAND() LIMIT 1", [level, topic]);
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

app.get("/api/listening/test", async (req, res) => {
    try {
        const { level, topic } = req.query;
        let sql = "SELECT * FROM listening_audios WHERE level_id = ? AND topic_id = ? ORDER BY RAND() LIMIT 1";
        // Fallback random nếu không có topic
        const [check] = await pool.query(sql, [level, topic]);
        const [audios] = await pool.query(check.length ? sql : "SELECT * FROM listening_audios ORDER BY RAND() LIMIT 1", check.length ? [level, topic] : []);
        
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

app.get("/api/writing/test", async (req, res) => {
    try {
        const { level, topic, task } = req.query;
        let sql = "SELECT * FROM writing_prompts WHERE level_id = ? AND topic_id = ?";
        const params = [level, topic];
        if (task) { sql += " AND task_type = ?"; params.push(task); }
        sql += " ORDER BY RAND() LIMIT 1";
        
        const [prompts] = await pool.query(sql, params);
        if (prompts.length === 0) {
            const [rand] = await pool.query("SELECT * FROM writing_prompts ORDER BY RAND() LIMIT 1");
            return res.status(200).json(rand[0] || {});
        }
        res.status(200).json(prompts[0]);
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

app.get("/api/speaking/test", async (req, res) => {
  try {
    const { part } = req.query;
    let sql = "SELECT * FROM speaking_questions WHERE part = ? ORDER BY RAND() LIMIT 1";
    const [questions] = await pool.query(sql, [part]);
    if(questions.length === 0) {
        const [rand] = await pool.query("SELECT * FROM speaking_questions ORDER BY RAND() LIMIT 1");
        return res.status(200).json(rand[0] || {});
    }
    res.status(200).json(questions[0]);
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// ============================================================
// 5. AI INTEGRATION (REST API - GEMINI 2.0 FLASH)
// ============================================================

// Helper: Gọi Google REST API
async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error("Thiếu API Key");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  if (!response.ok) {
     const errData = await response.json();
     throw new Error(errData.error?.message || "Lỗi Google API");
  }

  const data = await response.json();
  let text = data.candidates[0].content.parts[0].text;
  
  // Clean JSON
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  if (text.indexOf('{') > -1) text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  
  return JSON.parse(text);
}

// API: Chấm điểm Writing (AI)
app.post("/api/writing/grade", async (req, res) => {
  try {
    const { topic, essay, level } = req.body;
    if (!essay || essay.length < 10) return res.status(400).json({ message: "Bài viết quá ngắn." });

    console.log("🤖 AI Grading...");
    const prompt = `Act as VSTEP Examiner. Grade level ${level}. Topic: ${topic}. Essay: "${essay}". Return JSON ONLY: { "score": "...", "comment": "...", "corrections": [], "suggestion": "..." }`;
    
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
    const prompt = `Dictionary lookup for "${word}". Return JSON ONLY: { "word": "${word}", "phonetic": "...", "type": "...", "meaning_vi": "...", "description": "...", "examples": [{"en": "...", "vi": "..."}], "synonyms": [] }`;
    
    const result = await callGemini(prompt);
    res.status(200).json(result);
  } catch (err) { res.status(500).json({ message: "Lỗi tra từ." }); }
});

// === 13. API AI GIẢI THÍCH CÂU HỎI ===
app.post("/api/ai/explain", async (req, res) => {
  try {
    const { question, options, correct, userAnswer } = req.body;

    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "Thiếu API Key." });

    console.log("🤖 AI đang phân tích và giải thích...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const prompt = `
      Bạn là một giáo viên luyện thi tiếng Anh VSTEP chuyên nghiệp, tận tâm và giải thích cực kỳ dễ hiểu cho người Việt.
      Hãy giải thích câu hỏi trắc nghiệm sau đây:

      - Câu hỏi: "${question}"
      - Các lựa chọn: ${JSON.stringify(options)}
      - Đáp án đúng là: ${correct}
      ${userAnswer ? `- Học viên đã chọn: ${userAnswer}` : ""}

      Yêu cầu trả về kết quả dưới dạng JSON (Không Markdown, không lời dẫn) theo cấu trúc sau:
      {
        "translation": "Dịch câu hỏi và 4 đáp án sang tiếng Việt sát nghĩa.",
        "explanation": "Giải thích chi tiết bằng Tiếng Việt. Bắt buộc phải trích dẫn (quote) câu tiếng Anh trong bài đọc chứa thông tin trả lời, sau đó dịch câu đó ra và giải thích tại sao nó dẫn đến đáp án đúng. Giải thích ngắn gọn tại sao các phương án còn lại sai (nếu là bẫy).",
        "key_vocabulary": ["từ vựng 1 (loại từ): nghĩa tiếng việt", "từ vựng 2: nghĩa"]
      }
    `;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
       const errData = await response.json();
       throw new Error(errData.error?.message || "Lỗi Google API");
    }

    const data = await response.json();
    
    // Kiểm tra dữ liệu trả về
    if (!data.candidates || !data.candidates[0].content) {
        throw new Error("AI không phản hồi.");
    }

    let text = data.candidates[0].content.parts[0].text;

    // Clean JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    if (text.indexOf('{') > -1) text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);

    res.status(200).json(JSON.parse(text));

  } catch (err) {
    console.error("Lỗi AI Explain:", err.message);
    res.status(500).json({ message: "AI đang bận, vui lòng thử lại." });
  }
});

// ============================================================
// 6. USER HISTORY (Lịch sử làm bài)
// ============================================================

app.post("/api/results", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET); // Dùng đúng JWT_SECRET
    
    const { skill, level, score, duration } = req.body; 
    const sql = "INSERT INTO lich_su_lam_bai (user_id, ky_nang, trinh_do, diem_so, thoi_gian_lam) VALUES (?, ?, ?, ?, ?)";
    await pool.query(sql, [decoded.userId, skill, level, score, duration]);
    res.status(201).json({ message: "Saved!" });
  } catch (err) { res.status(500).json({ message: "Lỗi lưu điểm." }); }
});

app.get("/api/results/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET); // Dùng đúng JWT_SECRET
    
    const sql = "SELECT * FROM lich_su_lam_bai WHERE user_id = ? ORDER BY ngay_lam DESC LIMIT 20";
    const [history] = await pool.query(sql, [decoded.userId]);
    
    const formatted = history.map(h => ({
      ...h,
      date: new Date(h.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(h.ngay_lam).toLocaleTimeString('vi-VN')
    }));
    res.status(200).json(formatted);
  } catch (err) { res.status(500).json({ message: "Lỗi server." }); }
});

// KHỞI ĐỘNG SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại: http://localhost:${PORT}`));