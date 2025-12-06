import React, { useState, useEffect } from 'react';
import { 
  Clock, ArrowLeft, CheckCircle, XCircle, BookOpen, 
  AlertTriangle, Sparkles, Loader2, Play, Home,
  Globe, Lightbulb, BookMarked, Settings, Type
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
  
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); 
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  // AI State
  const [aiExplanations, setAiExplanations] = useState({}); 
  const [explainingId, setExplainingId] = useState(null); 

  // Setting State (Tùy chỉnh cỡ chữ)
  const [fontSize, setFontSize] = useState('text-base'); // text-sm, text-base, text-lg

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

  // 2. TIMER
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
    
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStarted, isSubmitted]);

  // HANDLERS
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleAnswer = (qId, option) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleStart = () => setIsStarted(true);

  const handleExit = () => {
    if (isSubmitted) { navigate('/practice/reading'); return; }
    if (window.confirm("Bạn đang làm bài. Thoát sẽ mất kết quả. Bạn chắc chắn chứ?")) {
      navigate('/practice/reading');
    }
  };

  const handleSubmit = async () => {
    if (!isSubmitted && window.confirm("Nộp bài ngay?")) {
      setIsSubmitted(true);
      setShowResult(true);

      let correctCount = 0;
      testData.questions.forEach(q => {
        if (answers[q.id] === q.correct) correctCount++;
      });
      const finalScore = Math.round((correctCount / testData.questions.length) * 100) / 10;

      const token = localStorage.getItem('vstep_token');
      if (token) {
        try {
          await fetch('http://localhost:5000/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              skill: 'reading', level: level, score: finalScore, duration: (60 * 60) - timeLeft
            })
          });
        } catch (e) { console.error(e); }
      }
    }
  };

  const handleAiExplain = async (questionId, questionData) => {
    if (aiExplanations[questionId]) return;
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
    } catch (err) { alert("Lỗi AI: " + err.message); } 
    finally { setExplainingId(null); }
  };

  // --- RENDER ---
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Đang chuẩn bị đề thi...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-red-100">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Không thể tải đề thi</h3>
        <p className="text-slate-500 mb-6 text-sm">{error}</p>
        <button onClick={() => navigate('/practice/reading')} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition font-medium">Quay lại</button>
      </div>
    </div>
  );

  // START SCREEN
  if (!isStarted) {
    return (
      <div className="h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Decor */}
          <div className="bg-indigo-600 w-full md:w-1/3 p-8 flex flex-col justify-between text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-indigo-900/20 z-0"></div>
             <div className="relative z-10">
               <BookOpen className="w-12 h-12 mb-4 opacity-80" />
               <h2 className="text-2xl font-bold mb-1">Reading Test</h2>
               <p className="text-indigo-200 text-sm">Kỹ năng Đọc hiểu</p>
             </div>
             <div className="relative z-10 mt-8 space-y-4">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                   <p className="text-xs text-indigo-200 uppercase font-bold">Trình độ</p>
                   <p className="text-xl font-bold">{level}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                   <p className="text-xs text-indigo-200 uppercase font-bold">Chủ đề</p>
                   <p className="text-lg font-bold capitalize">{topic}</p>
                </div>
             </div>
          </div>

          {/* Right Content */}
          <div className="w-full md:w-2/3 p-10">
             <h3 className="text-xl font-bold text-slate-800 mb-6">Thông tin bài thi</h3>
             
             <div className="space-y-4 mb-8">
               <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Clock size={20}/></div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold">Thời gian</p>
                    <p className="text-slate-800 font-medium">60 phút</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={20}/></div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold">Số câu hỏi</p>
                    <p className="text-slate-800 font-medium">{testData.questions.length} câu trắc nghiệm</p>
                  </div>
               </div>
             </div>

             <div className="flex gap-3">
               <button onClick={() => navigate('/practice/reading')} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">Hủy</button>
               <button onClick={handleStart} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                 <Play size={20} fill="currentColor" /> Bắt đầu ngay
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN SCREEN (SPLIT VIEW)
  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      
      {/* 1. HEADER (DARK THEME) */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md z-30 flex-shrink-0">
        <div className="flex items-center gap-4 overflow-hidden">
          <button onClick={handleExit} className="p-2 hover:bg-white/10 rounded-full transition text-slate-300 hover:text-white" title="Thoát">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
             <h1 className="font-bold text-base truncate max-w-xs md:max-w-md leading-tight">{testData.title}</h1>
             <span className="text-xs text-slate-400">Reading Practice • {level}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Badge */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-lg font-bold border ${timeLeft < 300 ? 'bg-red-500/10 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-emerald-400'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          
          {!isSubmitted ? (
            <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/20 transition-all active:scale-95 text-sm">
              Nộp bài
            </button>
          ) : (
             <button onClick={() => navigate('/practice/reading')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold flex items-center gap-2 text-sm transition">
               <Home className="w-4 h-4"/> Thoát
             </button>
          )}
        </div>
      </header>

      {/* 2. CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT: BÀI ĐỌC (Paper Style) */}
        <div className="w-1/2 h-full overflow-y-auto bg-[#fcfbf9] border-r border-slate-300 relative">
          {/* Toolbar đọc */}
          <div className="sticky top-0 left-0 right-0 bg-[#fcfbf9]/95 backdrop-blur-sm border-b border-slate-200 p-3 flex justify-end gap-2 z-10 px-8">
             <button onClick={() => setFontSize('text-sm')} className={`p-1.5 rounded hover:bg-slate-200 ${fontSize === 'text-sm' ? 'bg-slate-200' : ''}`} title="Cỡ chữ nhỏ"><Type size={14}/></button>
             <button onClick={() => setFontSize('text-base')} className={`p-1.5 rounded hover:bg-slate-200 ${fontSize === 'text-base' ? 'bg-slate-200' : ''}`} title="Cỡ chữ vừa"><Type size={18}/></button>
             <button onClick={() => setFontSize('text-lg')} className={`p-1.5 rounded hover:bg-slate-200 ${fontSize === 'text-lg' ? 'bg-slate-200' : ''}`} title="Cỡ chữ lớn"><Type size={22}/></button>
          </div>

          <div className="max-w-3xl mx-auto p-8 lg:p-12">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 leading-tight border-b-2 border-indigo-500 pb-4 inline-block">
              {testData.title}
            </h2>
            <div 
              className={`prose prose-slate max-w-none text-justify font-serif text-slate-800 leading-loose ${fontSize}`}
              dangerouslySetInnerHTML={{ __html: testData.content }}
            />
          </div>
        </div>

        {/* RIGHT: CÂU HỎI (Modern Cards) */}
        <div className="w-1/2 h-full overflow-y-auto bg-slate-100 p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-8 pb-24">
            {testData.questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-shadow hover:shadow-md">
                
                {/* Question Number & Text */}
                <div className="flex gap-4 mb-5">
                  <span className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
                    {idx + 1}
                  </span>
                  <h3 className="text-slate-800 font-bold text-lg pt-0.5 leading-snug">{q.question}</h3>
                </div>

                {/* Options Grid */}
                <div className="grid gap-3 ml-12">
                  {q.options.map((opt) => {
                    const label = opt.charAt(0);
                    const isSelected = answers[q.id] === label;
                    
                    // Style logic
                    let containerClass = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50";
                    let icon = <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-indigo-600' : 'border-slate-300'}`}>{isSelected && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}</div>;

                    if (isSelected) containerClass = "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500";
                    
                    if (showResult) {
                      if (label === q.correct) {
                        containerClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                        icon = <CheckCircle size={20} className="text-green-600" />;
                      } else if (isSelected) {
                        containerClass = "border-red-500 bg-red-50 ring-1 ring-red-500 opacity-80";
                        icon = <XCircle size={20} className="text-red-500" />;
                      } else {
                        containerClass = "border-slate-100 opacity-40";
                      }
                    }

                    return (
                      <div 
                        key={opt}
                        onClick={() => !showResult && handleAnswer(q.id, label)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${containerClass}`}
                      >
                        <div className="flex-shrink-0">{icon}</div>
                        <span className={`text-sm font-medium ${isSelected || (showResult && label === q.correct) ? 'text-slate-900' : 'text-slate-600'}`}>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* AI Explain Card */}
                {showResult && (
                  <div className="mt-6 ml-12 pt-6 border-t border-dashed border-slate-200">
                    {aiExplanations[q.id] ? (
                      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden animate-fade-in">
                        <div className="bg-indigo-100/50 px-5 py-3 border-b border-indigo-100 flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-indigo-600" />
                           <h4 className="font-bold text-indigo-900 text-xs uppercase tracking-wide">Gia sư AI giải thích</h4>
                        </div>
                        <div className="p-5 space-y-4">
                           <div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-1"><Globe size={12}/> Dịch câu hỏi</div>
                              <p className="text-slate-700 italic text-sm">"{aiExplanations[q.id].translation}"</p>
                           </div>
                           <div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-1"><Lightbulb size={12}/> Giải thích</div>
                              <p className="text-slate-800 text-sm">{aiExplanations[q.id].explanation}</p>
                           </div>
                           {aiExplanations[q.id].key_vocabulary?.length > 0 && (
                             <div className="flex flex-wrap gap-2 mt-2">
                               {aiExplanations[q.id].key_vocabulary.map((v, i) => (
                                  <span key={i} className="text-xs bg-white border border-indigo-100 px-2 py-1 rounded text-indigo-600 font-semibold">{v}</span>
                               ))}
                             </div>
                           )}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAiExplain(q.id, q)}
                        disabled={explainingId === q.id}
                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                      >
                        {explainingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {explainingId === q.id ? "Đang phân tích..." : "Giải thích chi tiết bằng AI"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Questions Navigator */}
      <div className="h-16 bg-white border-t border-gray-200 px-6 flex items-center gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 flex-shrink-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:inline">Danh sách câu hỏi:</span>
        <div className="flex gap-2 overflow-x-auto pb-1 w-full scrollbar-hide items-center">
          {testData.questions.map((q, idx) => (
            <button
              key={q.id}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-bold transition-all flex items-center justify-center border
                ${answers[q.id] 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}
                ${showResult && answers[q.id] !== q.correct ? '!bg-red-500 !border-red-500 !text-white' : ''}
                ${showResult && answers[q.id] === q.correct ? '!bg-green-500 !border-green-500 !text-white' : ''}
              `}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadingPractice;