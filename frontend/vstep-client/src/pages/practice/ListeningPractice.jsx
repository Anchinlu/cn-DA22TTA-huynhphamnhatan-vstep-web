import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ArrowLeft, Clock, 
  Volume2, CheckCircle, XCircle, 
  BookOpen, AlertTriangle, Sparkles, Loader2,
  Globe, Lightbulb, BookMarked, Home,
  Headphones // <-- 1. ĐÃ THÊM IMPORT NÀY
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ListeningPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { level, topic } = location.state || { level: 'B1', topic: 'daily_life' };
  
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Quiz State
  const [isStarted, setIsStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60);

  // AI State
  const [aiExplanations, setAiExplanations] = useState({}); 
  const [explainingId, setExplainingId] = useState(null); 

  const audioRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/listening/test?level=${level}&topic=${topic}`);
        if (!response.ok) throw new Error('Không tìm thấy bài nghe.');
        const data = await response.json();
        setTestData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [level, topic]);

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

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Play error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatAudioTime = (time) => {
    if (!time) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- 2. ĐỊNH NGHĨA HÀM XỬ LÝ TRẢ LỜI ---
  const handleAnswer = (qId, option) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleStart = () => setIsStarted(true);

  const handleExit = () => {
    if (isSubmitted) { navigate('/practice/listening'); return; }
    if (window.confirm("Thoát bây giờ sẽ mất kết quả. Bạn chắc chắn chứ?")) {
        navigate('/practice/listening');
    }
  };

  const handleSubmit = () => {
    if (!isSubmitted && window.confirm("Nộp bài ngay?")) {
      setIsSubmitted(true);
      setShowResult(true);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      let correctCount = 0;
      testData.questions.forEach(q => {
        if (answers[q.id] === q.correct) correctCount++;
      });
      const finalScore = Math.round((correctCount / testData.questions.length) * 100) / 10;

      const token = localStorage.getItem('vstep_token');
      if (token) {
        fetch('http://localhost:5000/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ skill: 'listening', level, score: finalScore, duration: (40 * 60) - timeLeft })
        }).catch(e => console.error(e));
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAiExplain = async (questionId, questionData) => {
    if (aiExplanations[questionId]) return;
    setExplainingId(questionId);
    try {
      const res = await fetch('http://localhost:5000/api/ai/explain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionData.question, options: questionData.options,
          correct: questionData.correct, userAnswer: answers[questionId]
        })
      });
      const data = await res.json();
      setAiExplanations(prev => ({ ...prev, [questionId]: data }));
    } catch (err) { alert("Lỗi AI: " + err.message); } 
    finally { setExplainingId(null); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  // Màn hình chờ
  if (!isStarted) {
      return (
        <div className="h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Headphones className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{testData.title}</h1>
                <p className="text-gray-500 mb-8">Part {testData.part} • {level} • {topic}</p>
                <button onClick={handleStart} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <Play className="w-5 h-5 fill-current"/> Bắt đầu nghe
                </button>
            </div>
        </div>
      );
  }

  const correctCount = testData.questions.filter(q => answers[q.id] === q.correct).length;
  const totalQuestions = testData.questions.length;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* CỘT TRÁI: PLAYER */}
      <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
          <div className="flex items-center">
            <button onClick={handleExit} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
              <ArrowLeft size={20} />
            </button>
            <span className="ml-2 font-bold text-gray-700">Listening Test</span>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">Part {testData.part}</span>
        </div>

        <div className="flex-1 flex flex-col p-8 items-center justify-center bg-gradient-to-b from-white to-blue-50/30">
          <div className={`relative w-56 h-56 rounded-full shadow-2xl flex items-center justify-center mb-8 transition-all duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
            <div className="absolute inset-0 bg-blue-600 rounded-full opacity-5 animate-ping"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-inner"></div>
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 z-0">
               {[...Array(7)].map((_, i) => (
                 <div key={i} className={`w-2 bg-white/20 rounded-full transition-all duration-300 ${isPlaying ? 'animate-music-bar' : 'h-4'}`} style={{animationDelay: `${i * 0.1}s`}}></div>
               ))}
            </div>
            <button onClick={togglePlay} className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform text-blue-600 pl-1.5">
              {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
            </button>
          </div>

          <h2 className="text-lg font-bold text-gray-800 text-center mb-2 px-4 line-clamp-2">{testData.title}</h2>
          
          <div className="w-full mt-6">
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{width: `${(currentTime / (duration || 1)) * 100}%`}}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-medium font-mono">
              <span>{formatAudioTime(currentTime)}</span>
              <span>{formatAudioTime(duration)}</span>
            </div>
          </div>

          <audio ref={audioRef} src={testData.audio_url} onTimeUpdate={handleTimeUpdate} onEnded={handleAudioEnded} className="hidden" />

          {showResult && (
            <div className="w-full mt-8 bg-white p-5 rounded-2xl shadow-lg border border-indigo-50 text-center animate-fade-in-up">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Kết quả của bạn</p>
              <div className="text-4xl font-black text-blue-600 mb-2">{correctCount}<span className="text-2xl text-gray-300 font-normal">/{totalQuestions}</span></div>
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{Math.round((correctCount/totalQuestions)*100)}% Chính xác</div>
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: CÂU HỎI */}
      <div className="flex-1 flex flex-col h-full relative bg-gray-50">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
            <Volume2 size={18} /> <span className="hidden sm:inline">Sử dụng tai nghe để có trải nghiệm tốt nhất</span>
          </div>
          <div className="flex items-center gap-4">
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold transition-colors ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
                <Clock size={18} /><span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
             </div>
             {!isSubmitted ? (
                <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95">Nộp bài</button>
             ) : (
                <button onClick={() => navigate('/practice/listening')} className="px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2"><Home className="w-4 h-4"/> Trang chủ</button>
             )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {testData.questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl border-2 shadow-sm transition-all border-transparent hover:border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">{idx + 1}</span>
                  <span className="mt-1">{q.question}</span>
                </h3>

                <div className="space-y-3 ml-11">
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
                      <div key={opt} onClick={() => !showResult && handleAnswer(q.id, label)} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${style}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>{isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}</div>
                        <span className="font-medium text-sm sm:text-base">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* AI Explain */}
                {showResult && (
                  <div className="mt-6 ml-11 pt-4 border-t border-dashed border-gray-200">
                    {aiExplanations[q.id] ? (
                      <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 animate-fade-in">
                        <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold text-sm uppercase"><Sparkles className="w-4 h-4" /> AI Giải thích</div>
                        <div className="space-y-3">
                            <div><span className="text-xs font-bold text-gray-500 uppercase flex gap-1 mb-1"><Globe size={12}/> Dịch</span><p className="text-gray-800 italic text-sm">"{aiExplanations[q.id].translation}"</p></div>
                            <div><span className="text-xs font-bold text-gray-500 uppercase flex gap-1 mb-1"><Lightbulb size={12}/> Giải thích</span><p className="text-gray-800 text-sm">{aiExplanations[q.id].explanation}</p></div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => handleAiExplain(q.id, q)} disabled={explainingId === q.id} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all">
                        {explainingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {explainingId === q.id ? "Đang suy nghĩ..." : "Giải thích bằng AI"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes music-bar { 0%, 100% { height: 10px; } 50% { height: 30px; } }
        .animate-music-bar { animation: music-bar 1s ease-in-out infinite; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ListeningPractice;