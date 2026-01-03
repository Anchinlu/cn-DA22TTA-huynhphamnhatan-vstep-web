import express from "express";
import { callGemini } from "../utils/aiHelper.js";

const router = express.Router();

// AI: Grade Writing
router.post("/ai/grade-writing", async (req, res) => {
  try {
    const { question, studentAnswer } = req.body;
    const text = (studentAnswer || "").toString().trim();
    if (!text || text.length < 10) {
      return res.status(200).json({ score: 0, feedback: "Không có bài làm hoặc quá ngắn" });
    }
    const prompt = `
      Bạn là giám khảo VSTEP. Hãy chấm điểm bài viết sau:
      Đề bài: "${question}"
      Bài làm: "${studentAnswer}"
      Yêu cầu: Chấm trên thang điểm 10. Trả về duy nhất định dạng JSON:
      {"score": số_điểm, "feedback": "nhận xét ngắn gọn"}
    `;
    const result = await callGemini(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ score: 0, feedback: "Lỗi chấm điểm" });
  }
});

// AI: Grade Speaking
router.post("/ai/grade-speaking", async (req, res) => {
  try {
    const { question, studentResponse } = req.body;
    const resp = (studentResponse || "").toString().trim();
    if (!resp || resp === 'Chưa ghi âm') {
      return res.status(200).json({ score: 0 });
    }
    const prompt = `
      Bạn là giám khảo VSTEP. Chấm điểm kỹ năng nói (giả lập).
      Câu hỏi: "${question}"
      Trạng thái bài làm: "${studentResponse}"
      Yêu cầu: Nếu đã ghi âm, cho điểm từ 5-9 dựa trên độ khó. Nếu chưa, cho 0.
      Trả về duy nhất định dạng JSON: {"score": số_điểm}
    `;
    const result = await callGemini(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ score: 0 });
  }
});

// API: Speaking Grade
router.post("/speaking/grade", async (req, res) => {
  try {
    const { topic, transcript, part } = req.body;
    if (!transcript || transcript.length < 5) return res.status(400).json({ message: "Chưa nghe rõ." });
    const prompt = `Act as VSTEP Examiner. Grade Speaking Part ${part}. Q: "${topic}". Ans: "${transcript}". Return JSON: { "score": number(0-10), "comment": "Vietnamese", "better_response": "English", "vocabulary_suggestions": ["words"] }`;
    const result = await callGemini(prompt);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi AI." });
  }
});

// API: Writing Grade
router.post("/writing/grade", async (req, res) => {
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

// API: Dictionary Lookup
router.post("/dictionary/lookup", async (req, res) => {
  try {
    const { word } = req.body;
    const prompt = `Dictionary lookup for "${word}". Return JSON ONLY: { "word": "${word}", "phonetic": "string", "type": "string", "meaning_vi": "string (vietnamese)", "description": "string (english definition)", "examples": [{"en": "string", "vi": "string"}], "synonyms": ["string"] }`;

    const result = await callGemini(prompt);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tra từ." });
  }
});

// API: AI Explain
router.post("/ai/explain", async (req, res) => {
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

export default router;
