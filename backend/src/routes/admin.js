import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { uploadMedia, uploadExcel } from "../config/cloudinary.js";
import xlsx from "xlsx";
import slugify from "slugify";
import { JWT_SECRET } from "../utils/constants.js";

const router = express.Router();

// Middleware: Xác thực Admin
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.vaiTroId !== 3) {
      return res.status(403).json({ message: "Chỉ Admin mới có quyền truy cập" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Lấy danh sách Topic (PUBLIC - không cần auth)
router.get("/topics", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM topics ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm Topic (ADMIN ONLY)
router.post("/topics", verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Tên chủ đề không được trống" });
    const slug = slugify(name, { lower: true, strict: true });

    const [result] = await pool.query("INSERT INTO topics (name, slug) VALUES (?, ?)", [name, slug]);
    res.json({ id: result.insertId, name, slug, message: "Thêm chủ đề thành công" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Chủ đề đã tồn tại" });
    res.status(500).json({ error: err.message });
  }
});

// Preview Excel
router.post("/preview-excel", verifyAdmin, uploadExcel.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Vui lòng chọn file Excel" });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    res.json({ message: "Đọc file thành công", total: data.length, data: data });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đọc file: " + error.message });
  }
});

// Upload Media
router.post("/upload-media", verifyAdmin, uploadMedia.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Upload thất bại" });
  res.json({ url: req.file.path, filename: req.file.filename, message: "Upload thành công" });
});

// Tạo Đề Reading
router.post("/create-reading", verifyAdmin, async (req, res) => {
  try {
    const { title, content, level, topic_id, questions } = req.body;

    const [resPassage] = await pool.query(
      `INSERT INTO reading_passages (title, content, level_id, topic_id) VALUES (?, ?, ?, ?)`,
      [title, content, level, topic_id]
    );
    const passageId = resPassage.insertId;

    if (questions && questions.length > 0) {
      const sqlQ = `INSERT INTO reading_questions (passage_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES ?`;

      const values = questions.map(q => [
        passageId,
        q.Question || q.question || q.question_text,
        q.OptionA || q.option_a,
        q.OptionB || q.option_b,
        q.OptionC || q.option_c,
        q.OptionD || q.option_d,
        q.Correct || q.correct || q.correct_answer,
      ]);
      await pool.query(sqlQ, [values]);
    }
    res.json({ message: "Tạo đề Reading thành công!", id: passageId });
  } catch (err) {
    console.error("Lỗi tạo Reading:", err);
    res.status(500).json({ error: err.message });
  }
});

//Tạo đề Listening 
router.post("/create-listening", verifyAdmin, async (req, res) => {
  try {
    const { title, script_content, audio_url, level, topic_id, questions } = req.body;

    // Ràng buộc: Phải có ít nhất 1 nguồn âm thanh
    if (!script_content && !audio_url) {
      return res.status(400).json({ message: "Vui lòng cung cấp Script AI hoặc link MP3" });
    }

    const [resAudio] = await pool.query(
      `INSERT INTO listening_audios (title, script_content, audio_url, level_id, topic_id) VALUES (?, ?, ?, ?, ?)`,
      [title, script_content || null, audio_url || null, level, topic_id]
    );
    const audioId = resAudio.insertId;

    if (questions && questions.length > 0) {
      const sqlQ = `INSERT INTO listening_questions (audio_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES ?`;
      const values = questions.map(q => [
        audioId,
        q.question_text || q.Question,
        q.option_a || q.OptionA,
        q.option_b || q.OptionB,
        q.option_c || q.OptionC,
        q.option_d || q.OptionD,
        q.correct_answer || q.Correct,
      ]);
      await pool.query(sqlQ, [values]);
    }
    res.json({ message: "Tạo đề Listening thành công!", id: audioId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tạo Đề Writing
router.post("/create-writing", verifyAdmin, async (req, res) => {
  try {
    const { title, content, level, topic_id, task_type } = req.body;

    if (!title || !content) return res.status(400).json({ message: "Tiêu đề và nội dung đề không được trống" });

    const [result] = await pool.query(
      `INSERT INTO writing_prompts (title, question_text, level_id, topic_id, task_type) VALUES (?, ?, ?, ?, ?)`,
      [title, content, level, topic_id, task_type]
    );

    res.json({ message: "Tạo đề Writing thành công!", id: result.insertId });
  } catch (err) {
    console.error("Lỗi tạo Writing:", err);
    res.status(500).json({ error: err.message });
  }
});

// Tạo Đề Speaking
router.post("/create-speaking", verifyAdmin, async (req, res) => {
  try {
    const { title, content, part, level, topic_id } = req.body;

    if (!title) return res.status(400).json({ message: "Tiêu đề không được trống" });

    const [result] = await pool.query(
      `INSERT INTO speaking_questions (title, question_text, level_id, topic_id, part) VALUES (?, ?, ?, ?, ?)`,
      [title, content, level, topic_id, part]
    );

    res.json({ message: "Tạo đề Speaking thành công!", id: result.insertId });
  } catch (err) {
    console.error("Lỗi tạo Speaking:", err);
    res.status(500).json({ error: err.message });
  }
});

// API: Lấy chi tiết 1 đề thi để Xem/Sửa
router.get("/questions/:type/:id", verifyAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    let mainTable = "";
    let questionTable = "";
    let joinCol = "";

    if (type === 'reading') { mainTable = 'reading_passages'; questionTable = 'reading_questions'; joinCol = 'passage_id'; }
    else if (type === 'listening') { mainTable = 'listening_audios'; questionTable = 'listening_questions'; joinCol = 'audio_id'; }
    else if (type === 'writing') { mainTable = 'writing_prompts'; questionTable = ''; joinCol = ''; }
    else if (type === 'speaking') { mainTable = 'speaking_questions'; questionTable = ''; joinCol = ''; }
    else return res.status(400).json({ message: 'Type không hợp lệ' });

    const [mainData] = await pool.query(`SELECT * FROM ${mainTable} WHERE id = ?`, [id]);
    if (!mainData || mainData.length === 0) return res.status(404).json({ message: "Không tìm thấy đề thi" });

    let questions = [];
    if (questionTable) {
      const [qs] = await pool.query(`SELECT * FROM ${questionTable} WHERE ${joinCol} = ?`, [id]);
      questions = qs;
    }

    res.json({ ...mainData[0], questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Xóa 1 đề thi (kèm câu hỏi) theo type và id
router.delete('/questions/:type/:id', verifyAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type === 'reading') {
      await pool.query('DELETE FROM reading_questions WHERE passage_id = ?', [id]);
      await pool.query('DELETE FROM reading_passages WHERE id = ?', [id]);
    } else if (type === 'listening') {
      await pool.query('DELETE FROM listening_questions WHERE audio_id = ?', [id]);
      await pool.query('DELETE FROM listening_audios WHERE id = ?', [id]);
    } else if (type === 'writing') {
      await pool.query('DELETE FROM writing_prompts WHERE id = ?', [id]);
      // writing_prompts currently contains the prompt itself; no separate questions table
    } else if (type === 'speaking') {
      await pool.query('DELETE FROM speaking_questions WHERE id = ?', [id]);
    } else {
      return res.status(400).json({ message: 'Type không hợp lệ' });
    }
    res.json({ message: 'Xóa đề thi thành công' });
  } catch (err) {
    console.error('Lỗi xóa đề:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Cập nhật 1 đề thi (cho phép update nội dung chính và thay câu hỏi mới)
router.put('/questions/:type/:id', verifyAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const payload = req.body || {};

    if (type === 'reading') {
      const { title, content, level_id, topic_id, questions } = payload;
      await pool.query(`UPDATE reading_passages SET title = ?, content = ?, level_id = ?, topic_id = ? WHERE id = ?`, [title || null, content || null, level_id || null, topic_id || null, id]);
      if (Array.isArray(questions)) {
        await pool.query('DELETE FROM reading_questions WHERE passage_id = ?', [id]);
        if (questions.length > 0) {
          const sqlQ = `INSERT INTO reading_questions (passage_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES ?`;
          const values = questions.map(q => [id, q.Question || q.question || q.question_text, q.OptionA || q.option_a, q.OptionB || q.option_b, q.OptionC || q.option_c, q.OptionD || q.option_d, q.Correct || q.correct || q.correct_answer]);
          await pool.query(sqlQ, [values]);
        }
      }

    } else if (type === 'listening') {
      const { title, script_content, audio_url, level_id, topic_id, questions } = payload;
      await pool.query(`UPDATE listening_audios SET title = ?, script_content = ?, audio_url = ?, level_id = ?, topic_id = ? WHERE id = ?`, [title || null, script_content || null, audio_url || null, level_id || null, topic_id || null, id]);
      if (Array.isArray(questions)) {
        await pool.query('DELETE FROM listening_questions WHERE audio_id = ?', [id]);
        if (questions.length > 0) {
          const sqlQ = `INSERT INTO listening_questions (audio_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES ?`;
          const values = questions.map(q => [id, q.question_text || q.Question, q.option_a || q.OptionA, q.option_b || q.OptionB, q.option_c || q.OptionC, q.option_d || q.OptionD, q.correct_answer || q.Correct]);
          await pool.query(sqlQ, [values]);
        }
      }

    } else if (type === 'writing') {
      const { title, question_text, level_id, topic_id, task_type } = payload;
      await pool.query(`UPDATE writing_prompts SET title = ?, question_text = ?, level_id = ?, topic_id = ?, task_type = ? WHERE id = ?`, [title || null, question_text || null, level_id || null, topic_id || null, task_type || null, id]);

    } else if (type === 'speaking') {
      const { title, question_text, level_id, topic_id, part } = payload;
      await pool.query(`UPDATE speaking_questions SET title = ?, question_text = ?, level_id = ?, topic_id = ?, part = ? WHERE id = ?`, [title || null, question_text || null, level_id || null, topic_id || null, part || null, id]);

    } else {
      return res.status(400).json({ message: 'Type không hợp lệ' });
    }

    res.json({ message: 'Cập nhật đề thi thành công' });
  } catch (err) {
    console.error('Lỗi cập nhật đề:', err);
    res.status(500).json({ error: err.message });
  }
});

// [MỚI] API lấy danh sách ngân hàng câu hỏi tổng hợp
router.get("/question-bank", verifyAdmin, async (req, res) => {
  try {
    // Lấy danh sách từ 4 bảng kỹ năng chính
    const [listening] = await pool.query(`
      SELECT la.id, la.title, la.level_id, t.name as topic_name, 'listening' as type 
      FROM listening_audios la
      LEFT JOIN topics t ON la.topic_id = t.id
      ORDER BY la.id DESC
    `);
    
    const [reading] = await pool.query(`
      SELECT rp.id, rp.title, rp.level_id, t.name as topic_name, 'reading' as type 
      FROM reading_passages rp
      LEFT JOIN topics t ON rp.topic_id = t.id
      ORDER BY rp.id DESC
    `);

    const [writing] = await pool.query(`
      SELECT wp.id, wp.title, wp.level_id, t.name as topic_name, 'writing' as type 
      FROM writing_prompts wp
      LEFT JOIN topics t ON wp.topic_id = t.id
      ORDER BY wp.id DESC
    `);

    const [speaking] = await pool.query(`
      SELECT sq.id, sq.title, sq.level_id, t.name as topic_name, 'speaking' as type 
      FROM speaking_questions sq
      LEFT JOIN topics t ON sq.topic_id = t.id
      ORDER BY sq.id DESC
    `);

    res.json({ listening, reading, writing, speaking });
  } catch (err) {
    console.error("Lỗi lấy ngân hàng câu hỏi:", err);
    res.status(500).json({ message: "Lỗi server khi tải ngân hàng câu hỏi" });
  }
});

export default router;
