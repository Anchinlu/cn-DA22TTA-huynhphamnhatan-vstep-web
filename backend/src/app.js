import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 
import path from 'path'; 
import { fileURLToPath } from 'url';

// (Không cần import GoogleGenerativeAI nữa vì ta dùng fetch trực tiếp)

// --- CẤU HÌNH MÔI TRƯỜNG ---
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); 

// --- KẾT NỐI CƠ SỞ DỮ LIỆU ---
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
    console.log("✅ Đã kết nối với cơ sở dữ liệu MySQL!");
    connection.release(); 
  })
  .catch(err => {
    console.error("❌ Kết nối CSDL thất bại:", err.message);
  });

// ==========================================
// CÁC API ROUTES
// ==========================================

app.get("/", (req, res) => res.send("✅ VSTEP Backend đang chạy!"));

// API Slideshow
app.get("/api/slideshow", async (req, res) => {
  try {
    const [slides] = await pool.query("SELECT * FROM slideshow ORDER BY thu_tu ASC");
    res.status(200).json(slides);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// API Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, mat_khau } = req.body;
    const [results] = await pool.query("SELECT * FROM nguoi_dung WHERE email = ?", [email]);

    if (results.length === 0) return res.status(404).json({ message: "Email không tồn tại" });

    const user = results[0];
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!isMatch && mat_khau !== user.mat_khau) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
    
    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: { id: user.user_id, hoTen: user.ho_ten, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// API Register
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

// API Reading Test
app.get("/api/reading/test", async (req, res) => {
  try {
    const { level, topic } = req.query;
    const [passages] = await pool.query("SELECT * FROM reading_passages WHERE level_id = ? AND topic_id = ? ORDER BY RAND() LIMIT 1", [level, topic]);
    
    if (passages.length === 0) return res.status(404).json({ message: "Chưa có bài đọc." });
    const passage = passages[0];

    const [questions] = await pool.query("SELECT * FROM reading_questions WHERE passage_id = ?", [passage.id]);
    
    res.status(200).json({
      id: passage.id,
      title: passage.title,
      content: passage.content,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question_text,
        options: [`A. ${q.option_a}`, `B. ${q.option_b}`, `C. ${q.option_c}`, `D. ${q.option_d}`],
        correct: q.correct_answer,
        explanation: q.explanation
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// API Listening Test
app.get("/api/listening/test", async (req, res) => {
  try {
    const { level, topic } = req.query;
    let query = "SELECT * FROM listening_audios WHERE level_id = ? AND topic_id = ? ORDER BY RAND() LIMIT 1";
    let params = [level, topic];
    const [check] = await pool.query(query, params);
    
    if (check.length === 0) {
       query = "SELECT * FROM listening_audios ORDER BY RAND() LIMIT 1";
       params = [];
    }

    const [audios] = await pool.query(query, params);
    if (audios.length === 0) return res.status(404).json({ message: "Chưa có bài nghe." });
    
    const audio = audios[0];
    const [questions] = await pool.query("SELECT * FROM listening_questions WHERE audio_id = ?", [audio.id]);

    res.status(200).json({
      id: audio.id,
      title: audio.title,
      audio_url: audio.audio_url,
      part: audio.part,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question_text,
        options: [`A. ${q.option_a}`, `B. ${q.option_b}`, `C. ${q.option_c}`, `D. ${q.option_d}`],
        correct: q.correct_answer,
        explanation: q.explanation
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
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
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// API Writing Test
app.get("/api/writing/test", async (req, res) => {
  try {
    const { level, topic, task } = req.query;
    let sql = "SELECT * FROM writing_prompts WHERE level_id = ? AND topic_id = ? AND task_type = ? ORDER BY RAND() LIMIT 1";
    const [prompts] = await pool.query(sql, [level, topic, task]);

    if (prompts.length === 0) {
        const [rand] = await pool.query("SELECT * FROM writing_prompts ORDER BY RAND() LIMIT 1");
        if(rand.length === 0) return res.status(404).json({ message: "Chưa có đề." });
        return res.status(200).json(rand[0]);
    }
    res.status(200).json(prompts[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// === 🔥 API MỚI: CHẤM ĐIỂM WRITING (SỬ DỤNG MODEL GEMINI 2.0 FLASH) ===
app.post("/api/writing/grade", async (req, res) => {
  try {
    const { topic, essay, level } = req.body;

    if (!essay || essay.length < 10) return res.status(400).json({ message: "Bài viết quá ngắn." });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "Chưa có API Key." });

    console.log("🤖 Đang chấm bài (REST API) - Model: gemini-2.0-flash...");

    const promptText = `
      Act as a VSTEP Examiner. Grade this essay based on level ${level}.
      Topic: ${topic}
      Essay: "${essay}"

      RESPONSE FORMAT: JSON ONLY.
      {
        "score": "Score/10",
        "comment": "Vietnamese feedback",
        "corrections": [{"original": "err", "correction": "fix", "reason": "vn reason"}],
        "suggestion": "Rewrite example"
      }
    `;

    // 👇 ĐÃ ĐỔI SANG GEMINI-2.0-FLASH (Theo danh sách key của bạn)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("❌ Lỗi từ Google:", errData);
      throw new Error(errData.error?.message || "Lỗi kết nối Google API");
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0].content) {
        throw new Error("AI không phản hồi nội dung.");
    }

    let text = data.candidates[0].content.parts[0].text;

    // Xử lý JSON sạch
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) text = text.substring(firstBrace, lastBrace + 1);

    const result = JSON.parse(text);
    console.log("✅ Chấm xong:", result.score);
    
    res.status(200).json(result);

  } catch (err) {
    console.error("❌ LỖI HỆ THỐNG:", err.message);
    res.status(500).json({ message: "Lỗi chấm điểm.", detail: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));