import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, ArrowLeft, CheckCircle, XCircle, BookOpen, 
  AlertTriangle, Sparkles, Loader2, Play, Home 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ReadingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { level, topic } = location.state || { level: 'B1', topic: 'education' }; 

  // --- STATE ---
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State điều khiển luồng bài thi
  const [isStarted, setIsStarted] = useState(false); // Trạng thái bắt đầu
  const [timeLeft, setTimeLeft] = useState(60 * 60); 
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // State cho AI
  const [aiExplanations, setAiExplanations] = useState({}); // Lưu giải thích của từng câu
  const [explainingId, setExplainingId] = useState(null); // Câu đang được AI giải thích

  // 1. FETCH ĐỀ THI
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/reading/test?level=${level}&topic=${topic}`);
        if (!response.ok) throw new Error('Không tìm thấy bài đọc phù hợp.');
        const data = await response.json();
        setTestData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [level, topic]);

  // 2. TIMER LOGIC
  useEffect(() => {
    if (!isStarted || isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cảnh báo khi reload trang
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStarted, isSubmitted]);

  // 3. HANDLERS
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleAnswer = (qId, option) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleExit = () => {
    if (isSubmitted) {
      navigate('/practice/reading');
      return;
    }
    if (window.confirm("Bạn đang làm bài. Nếu thoát bây giờ, kết quả sẽ không được lưu. Bạn chắc chắn muốn thoát?")) {
      navigate('/practice/reading');
    }
  };

  const handleSubmit = async () => {
    if (!isSubmitted && window.confirm("Bạn có chắc chắn muốn nộp bài không?")) {
      setIsSubmitted(true);
      setShowResult(true);

      // Tính điểm
      let correctCount = 0;
      testData.questions.forEach(q => {
        if (answers[q.id] === q.correct) correctCount++;
      });
      const finalScore = Math.round((correctCount / testData.questions.length) * 100) / 10;

      // Lưu điểm
      const token = localStorage.getItem('vstep_token');
      if (token) {
        try {
          await fetch('http://localhost:5000/api/results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              skill: 'reading',
              level: level,
              score: finalScore,
              duration: (60 * 60) - timeLeft
            })
          });
        } catch (e) { console.error(e); }
      }
    }
  };

  // === 4. GỌI AI GIẢI THÍCH ===
  const handleAiExplain = async (questionId, questionData) => {
    if (aiExplanations[questionId]) return; // Đã giải thích rồi thì không gọi lại
    
    setExplainingId(questionId);
    try {
      const res = await fetch('http://localhost:5000/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionData.question,
          options: questionData.options,
          correct: questionData.correct,
          userAnswer: answers[questionId]
        })
      });
      const data = await res.json();
      setAiExplanations(prev => ({ ...prev, [questionId]: data }));
    } catch (err) {
      alert("Lỗi kết nối AI: " + err.message);
    } finally {
      setExplainingId(null);
    }
  };

  // --- RENDER: LOADING / ERROR ---
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-600">Đang tải đề thi...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Lỗi tải đề</h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <button onClick={() => navigate('/practice/reading')} className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition">Quay lại Dashboard</button>
    </div>
  );

  // --- RENDER: MÀN HÌNH CHỜ (START SCREEN) ---
  if (!isStarted) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-xl text-center border border-gray-100">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">{testData.title}</h1>
          <div className="flex justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold uppercase">{level}</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold uppercase">{topic}</span>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-2xl text-left mb-8 space-y-3">
            <div className="flex items-center gap-3 text-blue-900">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Thời gian: 60 phút</span>
            </div>
            <div className="flex items-center gap-3 text-blue-900">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Số câu hỏi: {testData.questions.length} câu</span>
            </div>
            <div className="flex items-center gap-3 text-blue-900">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Hỗ trợ: Chấm điểm & Giải thích AI</span>
            </div>
          </div>

          <div className="flex gap-4">
             <button onClick={() => navigate('/practice/reading')} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">
               Quay lại
             </button>
             <button onClick={handleStart} className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
               <Play className="w-5 h-5 fill-current" /> Bắt đầu làm bài
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: MÀN HÌNH LÀM BÀI (SPLIT SCREEN) ---
  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <button onClick={handleExit} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition" title="Thoát">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-800 hidden md:block truncate max-w-md">
            {testData.title}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-lg font-bold transition-colors ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          
          {!isSubmitted && (
            <button 
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              Nộp bài
            </button>
          )}
          {isSubmitted && (
             <button onClick={() => navigate('/practice/reading')} className="px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2">
               <Home className="w-4 h-4"/> Trang chủ
             </button>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* TRÁI: BÀI ĐỌC */}
        <div className="w-1/2 h-full overflow-y-auto bg-white p-8 lg:p-12 border-r border-gray-200">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 leading-tight">{testData.title}</h2>
            <div 
              className="prose prose-lg prose-blue text-gray-700 leading-relaxed text-justify"
              dangerouslySetInnerHTML={{ __html: testData.content }}
            />
          </div>
        </div>

        {/* PHẢI: CÂU HỎI */}
        <div className="w-1/2 h-full overflow-y-auto bg-gray-50 p-6 lg:p-10">
          <div className="max-w-2xl mx-auto space-y-8 pb-20">
            {testData.questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center font-bold text-sm border border-slate-200">
                    {idx + 1}
                  </span>
                  <h3 className="text-gray-800 font-bold text-lg pt-0.5">{q.question}</h3>
                </div>

                <div className="space-y-3 ml-12">
                  {q.options.map((opt) => {
                    const label = opt.charAt(0);
                    const isSelected = answers[q.id] === label;
                    
                    let style = "border-gray-200 hover:bg-gray-50 hover:border-gray-300";
                    if (isSelected) style = "bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900 font-medium";
                    
                    if (showResult) {
                      if (label === q.correct) style = "bg-green-50 border-green-500 ring-1 ring-green-500 text-green-900 font-bold";
                      else if (isSelected) style = "bg-red-50 border-red-500 ring-1 ring-red-500 text-red-900 opacity-70";
                    }

                    return (
                      <div 
                        key={opt}
                        onClick={() => !showResult && handleAnswer(q.id, label)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${style}`}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>

                {/* --- AI EXPLAIN SECTION --- */}
                {showResult && (
                  <div className="mt-6 ml-12">
                    {aiExplanations[q.id] ? (
                      // Đã có giải thích từ AI
                      <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 animate-fade-in">
                        <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold">
                          <Sparkles className="w-5 h-5" /> Giải thích của AI:
                        </div>
                        <p className="text-sm text-indigo-900 font-medium mb-2">Dịch: "{aiExplanations[q.id].translation}"</p>
                        <p className="text-sm text-gray-700 mb-3">{aiExplanations[q.id].explanation}</p>
                        {aiExplanations[q.id].key_vocabulary?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {aiExplanations[q.id].key_vocabulary.map((v, i) => (
                              <span key={i} className="text-xs bg-white border border-indigo-200 px-2 py-1 rounded text-indigo-600 font-medium">{v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Nút gọi AI
                      <button 
                        onClick={() => handleAiExplain(q.id, q)}
                        disabled={explainingId === q.id}
                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                      >
                        {explainingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {explainingId === q.id ? "AI đang suy nghĩ..." : "Giải thích chi tiết bằng AI"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingPractice;