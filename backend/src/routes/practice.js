import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { JWT_SECRET } from "../utils/constants.js";

const router = express.Router();

// Listening - Lấy danh sách bài nghe
router.get("/listening/list", async (req, res) => {
  try {
    const { level, topic } = req.query;
    const sql = "SELECT id, title, duration FROM listening_audios WHERE level_id = ? AND topic_id = ?";
    const [rows] = await pool.query(sql, [level, topic]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Listening - Lấy bài nghe để làm
router.get("/listening/test", async (req, res) => {
  try {
    const { level, topic, id } = req.query;
    let sql = "";
    let params = [];

    if (id) {
      sql = "SELECT * FROM listening_audios WHERE id = ?";
      params = [id];
    } else {
      sql = "SELECT * FROM listening_audios WHERE level_id = ? AND topic_id = ? ORDER BY RAND() LIMIT 1";
      params = [level, topic];
    }

    const [audios] = await pool.query(sql, params);

    if (audios.length === 0 && !id) {
      const [rand] = await pool.query("SELECT * FROM listening_audios ORDER BY RAND() LIMIT 1");
      if (rand.length > 0) audios.push(rand[0]);
    }

    if (audios.length === 0) return res.status(404).json({ message: "Chưa có bài nghe." });

    const audio = audios[0];
    const [questions] = await pool.query("SELECT * FROM listening_questions WHERE audio_id = ?", [audio.id]);

    const formatted = questions.map(q => ({
      id: q.id,
      question: q.question_text,
      options: [`A. ${q.option_a}`, `B. ${q.option_b}`, `C. ${q.option_c}`, `D. ${q.option_d}`],
      correct: q.correct_answer,
      explanation: q.explanation,
    }));

    res.status(200).json({ ...audio, questions: formatted });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Listening - Lịch sử
router.get("/listening/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json([]);
    const decoded = jwt.verify(token, JWT_SECRET);

    const sql = `SELECT id, diem_so, thoi_gian_lam, ngay_lam, tieu_de_bai_thi FROM lich_su_lam_bai WHERE user_id = ? AND ky_nang = 'listening' ORDER BY ngay_lam DESC LIMIT 10`;
    const [rows] = await pool.query(sql, [decoded.userId]);

    const formatted = rows.map(r => ({
      ...r,
      ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(r.ngay_lam).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Reading - Lấy danh sách bài đọc
router.get("/reading/list", async (req, res) => {
  try {
    const { level, topic } = req.query;
    const sql = "SELECT id, title FROM reading_passages WHERE level_id = ? AND topic_id = ?";
    const [rows] = await pool.query(sql, [level, topic]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Reading - Lấy bài đọc để làm
router.get("/reading/test", async (req, res) => {
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
      if (rand.length > 0) passages.push(rand[0]);
    }

    if (passages.length === 0) return res.status(404).json({ message: "Chưa có bài đọc." });

    const passage = passages[0];
    const [questions] = await pool.query("SELECT * FROM reading_questions WHERE passage_id = ?", [passage.id]);

    const formatted = questions.map(q => ({
      id: q.id,
      question: q.question_text,
      options: [`A. ${q.option_a}`, `B. ${q.option_b}`, `C. ${q.option_c}`, `D. ${q.option_d}`],
      correct: q.correct_answer,
      explanation: q.explanation,
    }));

    res.status(200).json({ ...passage, questions: formatted });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Reading - Lịch sử
router.get("/reading/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json([]);
    const decoded = jwt.verify(token, JWT_SECRET);

    const sql = `SELECT id, diem_so, thoi_gian_lam, ngay_lam, tieu_de_bai_thi FROM lich_su_lam_bai WHERE user_id = ? AND ky_nang = 'reading' ORDER BY ngay_lam DESC LIMIT 10`;
    const [rows] = await pool.query(sql, [decoded.userId]);

    const formatted = rows.map(r => ({
      ...r,
      ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(r.ngay_lam).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Writing - Lấy danh sách đề
router.get("/writing/list", async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Writing - Lấy bài viết
router.get("/writing/test", async (req, res) => {
  try {
    const { id } = req.query;

    let sql = "SELECT * FROM writing_prompts WHERE id = ?";
    let params = [id];

    if (!id) {
      sql = "SELECT * FROM writing_prompts ORDER BY RAND() LIMIT 1";
      params = [];
    }

    const [prompts] = await pool.query(sql, params);
    if (prompts.length === 0) return res.status(404).json({ message: "Không tìm thấy đề bài." });

    res.status(200).json(prompts[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Writing - Lịch sử
router.get("/writing/history", async (req, res) => {
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
      ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN') + ' ' + new Date(r.ngay_lam).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Speaking - Lấy danh sách câu hỏi
router.get("/speaking/list", async (req, res) => {
  try {
    const { part, topic } = req.query;
    let sql = "SELECT id, title, part FROM speaking_questions WHERE 1=1";
    let params = [];
    if (part) {
      sql += " AND part = ?";
      params.push(part);
    }
    if (topic && topic !== 'all') {
      sql += " AND topic_id = ?";
      params.push(topic);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Speaking - Lấy bài nói
router.get("/speaking/test", async (req, res) => {
  try {
    const { id, part } = req.query;
    let sql = "";
    let params = [];

    if (id) {
      sql = "SELECT * FROM speaking_questions WHERE id = ?";
      params = [id];
    } else {
      sql = "SELECT * FROM speaking_questions WHERE part = ? ORDER BY RAND() LIMIT 1";
      params = [part || 1];
    }

    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy đề nói." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Speaking - Lịch sử
router.get("/speaking/history", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.json([]);
    const decoded = jwt.verify(token, JWT_SECRET);
    const sql = `SELECT id, diem_so, thoi_gian_lam, ngay_lam, tieu_de_bai_thi, bai_lam_text, ai_feedback FROM lich_su_lam_bai WHERE user_id = ? AND ky_nang = 'speaking' ORDER BY ngay_lam DESC LIMIT 10`;
    const [rows] = await pool.query(sql, [decoded.userId]);
    res.json(rows.map(r => ({ ...r, ngay_lam: new Date(r.ngay_lam).toLocaleDateString('vi-VN') })));
  } catch (err) {
    res.status(500).json({ message: "Err" });
  }
});

// Slideshow
router.get("/slideshow", async (req, res) => {
  try {
    const [slides] = await pool.query("SELECT * FROM slideshow ORDER BY thu_tu ASC");
    res.status(200).json(slides);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
