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

// Tạo Đề Listening
router.post("/create-listening", verifyAdmin, async (req, res) => {
  try {
    const { title, script_content, level, topic_id, questions } = req.body;

    if (!script_content) return res.status(400).json({ message: "Thiếu nội dung kịch bản (Script)" });

    const [resAudio] = await pool.query(
      `INSERT INTO listening_audios (title, script_content, level_id, topic_id) VALUES (?, ?, ?, ?)`,
      [title, script_content, level, topic_id]
    );
    const audioId = resAudio.insertId;

    if (questions && questions.length > 0) {
      const sqlQ = `INSERT INTO listening_questions (audio_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES ?`;

      const values = questions.map(q => [
        audioId,
        q.Question || q.question || q.question_text,
        q.OptionA || q.option_a,
        q.OptionB || q.option_b,
        q.OptionC || q.option_c,
        q.OptionD || q.option_d,
        q.Correct || q.correct || q.correct_answer,
      ]);
      await pool.query(sqlQ, [values]);
    }
    res.json({ message: "Tạo đề Listening (AI Script) thành công!", id: audioId });
  } catch (err) {
    console.error("Lỗi Listening:", err);
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

export default router;
