import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ArrowLeft, Clock, 
  Volume2, CheckCircle, XCircle, 
  HelpCircle, AlertTriangle, BookOpen 
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
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 phút mặc định

  const audioRef = useRef(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/listening/test?level=${level}&topic=${topic}`);
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Không tìm thấy bài nghe.');
        }
        
        const data = await response.json();
        
        setTestData(data);
      } catch (err) {
        console.error("Lỗi tải bài nghe:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [level, topic]);

  // --- 2. TIMER & AUDIO LOGIC ---
  useEffect(() => {
    if (isSubmitted || loading || error) return;
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
    return () => clearInterval(timer);
  }, [isSubmitted, loading, error]);

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

  // --- 3. SUBMIT & SAVE RESULT ---
  const saveResultToDB = async (score) => {
    const token = localStorage.getItem('vstep_token');
    if (!token) return;

    try {
      await fetch('http://localhost:5000/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill: 'listening',
          level: level,
          score: score,
          duration: (40 * 60) - timeLeft
        })
      });
      console.log("Đã lưu điểm Listening:", score);
    } catch (err) {
      console.error("Lỗi lưu điểm:", err);
    }
  };

  const handleSubmit = () => {
    if (window.confirm("Bạn có chắc chắn muốn nộp bài?")) {
      setIsSubmitted(true);
      setShowResult(true);
      
      // Dừng nhạc khi nộp
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      // Tính điểm
      let correctCount = 0;
      testData.questions.forEach(q => {
        if (answers[q.id] === q.correct) correctCount++;
      });
      
      const finalScore = (correctCount / testData.questions.length) * 10;
      const roundedScore = Math.round(finalScore * 10) / 10;

      // Lưu điểm
      saveResultToDB(roundedScore);
      
      alert(`Bạn đã hoàn thành! Điểm số: ${roundedScore}/10`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- RENDER ---
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium animate-pulse">Đang tải bài nghe...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Không tải được bài nghe</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => navigate('/practice/listening')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">Quay lại</button>
      </div>
    </div>
  );

  const correctCount = testData.questions.filter(q => answers[q.id] === q.correct).length;
  const totalQuestions = testData.questions.length;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* --- CỘT TRÁI: PLAYER (Cố định) --- */}
      <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col shadow-xl z-20">
        
        {/* Header Nhỏ */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/practice/listening')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
              <ArrowLeft size={20} />
            </button>
            <span className="ml-2 font-bold text-gray-700">Listening Test</span>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
            Part {testData.part}
          </span>
        </div>

        {/* Player Area */}
        <div className="flex-1 flex flex-col p-8 items-center justify-center bg-gradient-to-b from-white to-blue-50/30">
          
          {/* Đĩa nhạc / Visualizer */}
          <div className={`relative w-56 h-56 rounded-full shadow-2xl flex items-center justify-center mb-8 transition-all duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
            <div className="absolute inset-0 bg-blue-600 rounded-full opacity-5 animate-ping"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-inner"></div>
            
            {/* Sóng nhạc giả lập */}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 z-0">
               {[...Array(7)].map((_, i) => (
                 <div key={i} className={`w-2 bg-white/20 rounded-full transition-all duration-300 ${isPlaying ? 'animate-music-bar' : 'h-4'}`} style={{animationDelay: `${i * 0.1}s`}}></div>
               ))}
            </div>

            <button 
              onClick={togglePlay}
              className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform text-blue-600 pl-1.5"
            >
              {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
            </button>
          </div>

          <h2 className="text-lg font-bold text-gray-800 text-center mb-2 px-4 line-clamp-2">
            {testData.title}
          </h2>
          
          {/* Thanh thời gian */}
          <div className="w-full mt-6">
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                style={{width: `${(currentTime / (duration || 1)) * 100}%`}}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-medium font-mono">
              <span>{formatAudioTime(currentTime)}</span>
              <span>{formatAudioTime(duration)}</span>
            </div>
          </div>

          <audio 
            ref={audioRef} 
            src={testData.audio_url} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
            className="hidden" 
          />

          {/* Kết quả (Hiện khi nộp bài) */}
          {showResult && (
            <div className="w-full mt-8 bg-white p-5 rounded-2xl shadow-lg border border-indigo-50 text-center animate-fade-in-up">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Kết quả của bạn</p>
              <div className="text-4xl font-black text-blue-600 mb-2">
                {correctCount}<span className="text-2xl text-gray-300 font-normal">/{totalQuestions}</span>
              </div>
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                {Math.round((correctCount/totalQuestions)*100)}% Chính xác
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- CỘT PHẢI: CÂU HỎI (Scrollable) --- */}
      <div className="flex-1 flex flex-col h-full relative bg-gray-50">
        
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
            <Volume2 size={18} />
            <span className="hidden sm:inline">Sử dụng tai nghe để có trải nghiệm tốt nhất</span>
          </div>
          
          <div className="flex items-center gap-4">
            {!showResult && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold transition-colors ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
                <Clock size={18} />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
            
            {!showResult && (
              <button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-200 transition-all transform active:scale-95"
              >
                Nộp bài
              </button>
            )}
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {testData.questions.map((q, idx) => (
              <div 
                key={q.id} 
                className={`bg-white p-6 rounded-2xl border-2 transition-all duration-300 ${
                  showResult 
                    ? (answers[q.id] === q.correct ? 'border-green-200 bg-green-50/20' : 'border-red-100 bg-red-50/20')
                    : 'border-transparent shadow-sm hover:border-blue-100'
                }`}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="mt-1">{q.question}</span>
                </h3>

                <div className="space-y-3 ml-11">
                  {q.options.map((opt) => {
                    const label = opt.charAt(0);
                    const isSelected = answers[q.id] === label;
                    
                    let containerClass = "border border-gray-200 hover:bg-gray-50 hover:border-gray-300";
                    let icon = <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>{isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}</div>;

                    if (isSelected) containerClass = "border-2 border-blue-500 bg-blue-50 shadow-sm";

                    if (showResult) {
                      if (label === q.correct) {
                        containerClass = "border-2 border-green-500 bg-green-100 text-green-800 shadow-none";
                        icon = <CheckCircle size={20} className="text-green-600" />;
                      } else if (isSelected) {
                        containerClass = "border-2 border-red-400 bg-red-50 text-red-800 opacity-80 shadow-none";
                        icon = <XCircle size={20} className="text-red-500" />;
                      } else {
                        containerClass = "border border-gray-100 opacity-50 grayscale";
                      }
                    }

                    return (
                      <div 
                        key={opt}
                        onClick={() => !showResult && setAnswers({...answers, [q.id]: label})}
                        className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all ${containerClass}`}
                      >
                        <div className="flex-shrink-0">{icon}</div>
                        <span className="font-medium text-sm sm:text-base">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Giải thích */}
                {showResult && (
                  <div className="ml-11 mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-sm text-gray-600 animate-fade-in">
                    <p className="font-bold flex items-center gap-2 mb-1 text-gray-800">
                      <BookOpen size={16} className="text-blue-500"/> Giải thích:
                    </p>
                    {q.explanation || "Không có giải thích chi tiết."}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CSS Animation */}
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