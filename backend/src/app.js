import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 
import path from 'path'; 
import { fileURLToPath } from 'url';

// Import thư viện Google AI
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); 

// === KEY BÍ MẬT (QUAN TRỌNG: PHẢI GIỐNG NHAU Ở MỌI CHỖ) ===
// Ưu tiên lấy từ .env, nếu không có thì dùng chuỗi cố định này
const JWT_SECRET = process.env.JWT_SECRET || "vstep_secret_2025";

// Khởi tạo Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Kết nối Database
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
    console.log("✅ Đã kết nối Database!");
    conn.release(); 
  })
  .catch(err => console.error("❌ Lỗi kết nối DB:", err.message));

// ==========================================
// CÁC API ROUTES
// ==========================================

app.get("/", (req, res) => res.send("✅ VSTEP Backend Running"));

// API Slideshow
app.get("/api/slideshow", async (req, res) => {
  try {
    const [slides] = await pool.query("SELECT * FROM slideshow ORDER BY thu_tu ASC");
    res.status(200).json(slides);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 1. API Đăng Nhập
app.post("/api/login", async (req, res) => {
  try {
    const { email, mat_khau } = req.body;
    const [results] = await pool.query("SELECT * FROM nguoi_dung WHERE email = ?", [email]);

    if (results.length === 0) return res.status(404).json({ message: "Email không tồn tại" });

    const user = results[0];
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    // --- SỬA: Dùng biến JWT_SECRET thống nhất ---
    const token = jwt.sign(
      { userId: user.user_id, vaiTroId: user.vai_tro_id },
      JWT_SECRET, 
      { expiresIn: "1h" }
    );
    
    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: { id: user.user_id, hoTen: user.ho_ten, email: user.email, vaiTroId: user.vai_tro_id }
    });
  } catch (err) {
    console.error("Lỗi Login:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// 2. API Đăng Ký
app.post("/api/register", async (req, res) => {
  try {
    const { ho_ten, email, mat_khau } = req.body;
    const [results] = await pool.query("SELECT * FROM nguoi_dung WHERE email = ?", [email]);
    if (results.length > 0) return res.status(409).json({ message: "Email đã tồn tại" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(mat_khau, salt);
    await pool.query("INSERT INTO nguoi_dung (ho_ten, email, mat_khau, vai_tro_id, ngay_tao) VALUES (?, ?, ?, ?, NOW())", [ho_ten, email, hash, 1]); 
    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// ... (Giữ nguyên các API lấy đề thi Reading/Listening/Speaking/Writing/Dictionary) ...

// API Reading Test
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
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});
  
// API Listening Test
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
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});
  
// API Speaking Test
app.get("/api/speaking/test", async (req, res) => {
    try {
      const { part } = req.query;
      let sql = "SELECT * FROM speaking_questions WHERE part = ? ORDER BY RAND() LIMIT 1";
      const [questions] = await pool.query(sql, [part]);
      if(questions.length === 0) {
          const [rand] = await pool.query("SELECT * FROM speaking_questions ORDER BY RAND() LIMIT 1");
          return res.status(200).json(rand[0]);
      }
      res.status(200).json(questions[0]);
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});
  
// API Writing Test
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
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
});

// API Chấm điểm Writing (AI)
app.post("/api/writing/grade", async (req, res) => {
  try {
    const { topic, essay, level } = req.body;
    if (!essay || essay.length < 10) return res.status(400).json({ message: "Bài viết quá ngắn." });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "Thiếu API Key." });

    console.log("🤖 Đang chấm bài...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Act as VSTEP Examiner. Grade based on level ${level}. Topic: ${topic}. Essay: "${essay}". Return JSON: { "score": "...", "comment": "...", "corrections": [], "suggestion": "..." }`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    if (text.indexOf('{') > -1) text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    res.status(200).json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ message: "Lỗi chấm điểm.", detail: err.message });
  }
});
// API Tra từ
app.post("/api/dictionary/lookup", async (req, res) => {
    try {
      const { word } = req.body;
      if (!word) return res.status(400).json({ message: "Chưa nhập từ." });
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Dictionary lookup for "${word}". Return JSON ONLY: { "word": "${word}", "phonetic": "...", "type": "...", "meaning_vi": "...", "description": "...", "examples": [{"en": "...", "vi": "..."}], "synonyms": [] }`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      if (text.indexOf('{') > -1) text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      res.status(200).json(JSON.parse(text));
    } catch (err) {
      res.status(500).json({ message: "Lỗi tra từ." });
    }
});

// === 3. API LƯU KẾT QUẢ THI (SỬA LỖI) ===
app.post("/api/results", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // --- SỬA: Dùng đúng biến JWT_SECRET để giải mã ---
    const decoded = jwt.verify(token, JWT_SECRET);
    const { skill, level, score, duration } = req.body; 

    const sql = "INSERT INTO lich_su_lam_bai (user_id, ky_nang, trinh_do, diem_so, thoi_gian_lam) VALUES (?, ?, ?, ?, ?)";
    await pool.query(sql, [decoded.userId, skill, level, score, duration]);

    res.status(201).json({ message: "Saved!" });
  } catch (err) {
    console.error("Save Result Error:", err);
    res.status(500).json({ message: "Lỗi lưu điểm." });
  }
});

// === 4. API LẤY LỊCH SỬ (SỬA LỖI) ===
app.get("/api/results/history", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // --- SỬA: Dùng đúng biến JWT_SECRET để giải mã ---
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const sql = "SELECT * FROM lich_su_lam_bai WHERE user_id = ? ORDER BY ngay_lam DESC LIMIT 10";
    const [history] = await pool.query(sql, [decoded.userId]);

    const formatted = history.map(h => ({
      ...h,
      date: new Date(h.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(h.ngay_lam).toLocaleTimeString('vi-VN')
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Get History Error:", err);
    res.status(500).json({ message: "Lỗi lấy lịch sử." });
  }
});
// === 13. API AI GIẢI THÍCH CÂU HỎI (SỬ DỤNG REST API + GEMINI 2.0) ===
app.post("/api/ai/explain", async (req, res) => {
  try {
    const { question, options, correct, userAnswer } = req.body;

    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "Thiếu API Key." });

    console.log("🤖 AI đang giải thích câu hỏi...");

    const prompt = `
      Bạn là gia sư tiếng Anh VSTEP chuyên nghiệp. Hãy giải thích câu hỏi trắc nghiệm sau đây:
      - Câu hỏi: "${question}"
      - Các lựa chọn: ${JSON.stringify(options)}
      - Đáp án đúng: ${correct}
      ${userAnswer ? `- Học viên chọn: ${userAnswer}` : ""}

      Yêu cầu giải thích:
      1. Dịch câu hỏi sang tiếng Việt.
      2. Giải thích tại sao đáp án đúng là đúng (ngắn gọn).
      3. Giải thích tại sao các đáp án còn lại sai (nếu cần).
      
      Trả về định dạng JSON (Không Markdown):
      {
        "translation": "Dịch câu hỏi...",
        "explanation": "Giải thích chi tiết...",
        "key_vocabulary": ["từ 1: nghĩa", "từ 2: nghĩa"]
      }
    `;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
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
    let text = data.candidates[0].content.parts[0].text;

    // Clean JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    if (text.indexOf('{') > -1) text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);

    res.status(200).json(JSON.parse(text));

  } catch (err) {
    console.error("Lỗi AI Explain:", err.message);
    res.status(500).json({ message: "Không thể giải thích lúc này." });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại: http://localhost:${PORT}`));