import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { JWT_SECRET } from "../utils/constants.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Auto-generate Mock Test (only teacher/admin)
router.post("/auto-generate", verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Vui lòng nhập tên đề thi" });

    // only teacher(2) or admin(3)
    const roleId = parseInt(req.user.vaiTroId);
    if (roleId !== 2 && roleId !== 3) return res.status(403).json({ message: "Chỉ Teacher/Admin mới có quyền tạo đề" });

    const [audio] = await pool.query("SELECT id FROM listening_audios ORDER BY RAND() LIMIT 1");
    const listeningId = audio.length > 0 ? audio[0].id : null;

    const [readings] = await pool.query("SELECT id FROM reading_passages ORDER BY RAND() LIMIT 4");
    const readingIds = readings.map(r => r.id);

    const [wTask1] = await pool.query("SELECT id FROM writing_prompts WHERE task_type = 'task1' ORDER BY RAND() LIMIT 1");
    const [wTask2] = await pool.query("SELECT id FROM writing_prompts WHERE task_type = 'task2' ORDER BY RAND() LIMIT 1");
    const writingIds = [...wTask1.map(w => w.id), ...wTask2.map(w => w.id)];

    const [sPart1] = await pool.query("SELECT id FROM speaking_questions WHERE part = 1 ORDER BY RAND() LIMIT 1");
    const [sPart2] = await pool.query("SELECT id FROM speaking_questions WHERE part = 2 ORDER BY RAND() LIMIT 1");
    const [sPart3] = await pool.query("SELECT id FROM speaking_questions WHERE part = 3 ORDER BY RAND() LIMIT 1");
    const speakingIds = [...sPart1.map(s => s.id), ...sPart2.map(s => s.id), ...sPart3.map(s => s.id)];

    await pool.query(
      `INSERT INTO mock_tests (title, description, listening_id, reading_ids, writing_ids, speaking_ids) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || `Đề tự động ngày ${new Date().toLocaleDateString()}`, listeningId, JSON.stringify(readingIds), JSON.stringify(writingIds), JSON.stringify(speakingIds)]
    );

    res.json({ message: "Tạo đề thi thành công!", stats: { reading: readingIds.length, writing: writingIds.length, speaking: speakingIds.length } });
  } catch (err) {
    console.error("Lỗi sinh đề:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// Lấy danh sách Mock Test
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM mock_tests WHERE is_active = 1 ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tải danh sách đề thi" });
  }
});

// Lấy lịch sử thi thử (user-specific)
router.get("/history", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ket_qua_thi_thu WHERE user_id = ? ORDER BY ngay_thi DESC", [req.user.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tải lịch sử Mock Test" });
  }
});

// Lấy chi tiết Mock Test
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [tests] = await pool.query("SELECT * FROM mock_tests WHERE id = ?", [id]);
    if (tests.length === 0) return res.status(404).json({ message: "Không tìm thấy đề thi" });
    const test = tests[0];

    const rIds = typeof test.reading_ids === 'string' ? JSON.parse(test.reading_ids) : test.reading_ids || [];
    const wIds = typeof test.writing_ids === 'string' ? JSON.parse(test.writing_ids) : test.writing_ids || [];
    const sIds = typeof test.speaking_ids === 'string' ? JSON.parse(test.speaking_ids) : test.speaking_ids || [];

    let listeningData = null;
    if (test.listening_id) {
      const [audioRows] = await pool.query("SELECT * FROM listening_audios WHERE id = ?", [test.listening_id]);
      if (audioRows.length > 0) {
        listeningData = audioRows[0];
        const [lQuestions] = await pool.query("SELECT * FROM listening_questions WHERE audio_id = ?", [listeningData.id]);
        listeningData.questions = lQuestions;
      }
    }

    const [passages] = rIds.length > 0 ? await pool.query(`SELECT * FROM reading_passages WHERE id IN (?)`, [rIds]) : [[]];
    const [rQuestions] = rIds.length > 0 ? await pool.query(`SELECT * FROM reading_questions WHERE passage_id IN (?)`, [rIds]) : [[]];

    const readingData = passages.map(p => ({
      ...p,
      questions: rQuestions.filter(q => q.passage_id === p.id),
    }));

    const [writings] = wIds.length > 0 ? await pool.query(`SELECT * FROM writing_prompts WHERE id IN (?)`, [wIds]) : [[]];
    const [speakings] = sIds.length > 0 ? await pool.query(`SELECT * FROM speaking_questions WHERE id IN (?)`, [sIds]) : [[]];

    res.json({
      id: test.id,
      title: test.title,
      listening: listeningData,
      reading: readingData,
      writing: writings,
      speaking: speakings,
    });
  } catch (err) {
    console.error("Lỗi API Mock Test:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// Nộp bài và lưu kết quả thi thử (student hoặc teacher)
router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { listening_score, reading_score, writing_score, speaking_score, overall_score, chi_tiet_bai_lam } = req.body;

    const sql = `
      INSERT INTO ket_qua_thi_thu 
      (user_id, listening_score, reading_score, writing_score, speaking_score, overall_score, chi_tiet_bai_lam, ngay_thi) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await pool.query(sql, [
      req.user.userId,
      listening_score,
      reading_score,
      writing_score,
      speaking_score,
      overall_score,
      JSON.stringify(chi_tiet_bai_lam),
    ]);

    res.status(201).json({ message: "Đã lưu kết quả thi thử!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lưu kết quả thi." });
  }
});

export default router;
