import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ArrowLeft, Clock, 
  Volume2, CheckCircle, XCircle, 
  HelpCircle, AlertTriangle 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ListeningPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { level, topic } = location.state || { level: 'B1', topic: 'daily_life' };
  
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 phút mặc định

  const audioRef = useRef(null);

  // --- 1. FETCH DATA ---
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

  // --- 2. AUDIO LOGIC ---
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

  const formatAudioTime = (time) => {
    if (!time) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- 3. SUBMIT LOGIC ---
  const handleSubmit = () => {
    if (window.confirm("Bạn muốn nộp bài ngay?")) {
      setShowResult(true);
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- RENDER HELPERS ---
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium animate-pulse">Đang tải dữ liệu bài nghe...</p>
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

  // Tính điểm số
  const correctCount = testData.questions.filter(q => answers[q.id] === q.correct).length;
  const totalQuestions = testData.questions.length;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* --- CỘT TRÁI: PLAYER & INFO (35% width) --- */}
      <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col shadow-xl z-20">
        
        {/* Header Nhỏ */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <button onClick={() => navigate('/practice/listening')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
            <ArrowLeft size={20} />
          </button>
          <span className="ml-2 font-bold text-gray-700">Listening Test</span>
          <span className="ml-auto text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
            {level}
          </span>
        </div>

        {/* Player Container */}
        <div className="flex-1 flex flex-col p-8 items-center justify-center bg-gradient-to-b from-white to-blue-50/50">
          
          {/* Đĩa nhạc / Visualizer */}
          <div className={`relative w-48 h-48 rounded-full shadow-2xl flex items-center justify-center mb-8 transition-all duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
            <div className="absolute inset-0 bg-blue-600 rounded-full opacity-10 animate-ping"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full"></div>
            
            {/* Sóng nhạc giả lập */}
            <div className="absolute inset-0 flex items-center justify-center gap-1">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={`w-2 bg-white/30 rounded-full transition-all duration-300 ${isPlaying ? 'animate-music-bar' : 'h-4'}`} style={{animationDelay: `${i * 0.1}s`}}></div>
               ))}
            </div>

            <button 
              onClick={togglePlay}
              className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-blue-600 pl-1"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-800 text-center mb-2 px-4 line-clamp-2">
            {testData.title}
          </h2>
          <p className="text-sm text-gray-500 font-medium mb-6">Topic: {topic.charAt(0).toUpperCase() + topic.slice(1)}</p>

          {/* Progress Bar (Simple) */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
              style={{width: `${(currentTime / (duration || 1)) * 100}%`}}
            ></div>
          </div>
          <div className="w-full flex justify-between text-xs text-gray-400 font-medium mb-8">
            <span>{formatAudioTime(currentTime)}</span>
            <span>{formatAudioTime(duration)}</span>
          </div>

          <audio 
            ref={audioRef} 
            src={testData.audio_url} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="hidden" 
          />

          {/* Kết quả (Hiện khi nộp bài) */}
          {showResult && (
            <div className="w-full bg-white p-4 rounded-xl shadow-lg border border-gray-100 text-center animate-fade-in-up">
              <p className="text-sm text-gray-500 mb-1">Kết quả của bạn</p>
              <div className="text-3xl font-extrabold text-blue-600 mb-2">
                {correctCount}/{totalQuestions}
              </div>
              <div className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full inline-block">
                {Math.round((correctCount/totalQuestions)*100)}% Chính xác
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- CỘT PHẢI: CÂU HỎI (Scrollable) --- */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Top Bar bên phải */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Volume2 size={18} />
            <span className="hidden sm:inline">Điều chỉnh âm lượng thiết bị để nghe rõ nhất</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 font-mono font-bold">
              <Clock size={16} />
              <span>40:00</span>
            </div>
            {!showResult && (
              <button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-200 transition-all"
              >
                Nộp bài
              </button>
            )}
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {testData.questions.map((q, idx) => (
              <div 
                key={q.id} 
                className={`bg-white p-6 rounded-2xl border-2 transition-all duration-300 ${
                  showResult 
                    ? (answers[q.id] === q.correct ? 'border-green-200 bg-green-50/30' : 'border-red-100 bg-red-50/30')
                    : 'border-transparent shadow-sm hover:border-blue-100'
                }`}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span>{q.question}</span>
                </h3>

                <div className="grid gap-3 ml-11">
                  {q.options.map((opt) => {
                    const label = opt.charAt(0);
                    const isSelected = answers[q.id] === label;
                    
                    // Logic màu sắc phức tạp cho kết quả
                    let containerClass = "border border-gray-200 hover:bg-gray-50 hover:border-gray-300";
                    let icon = <div className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}></div>;

                    if (isSelected) containerClass = "border-2 border-blue-500 bg-blue-50 shadow-sm";

                    if (showResult) {
                      if (label === q.correct) {
                        containerClass = "border-2 border-green-500 bg-green-100 text-green-800";
                        icon = <CheckCircle size={20} className="text-green-600" />;
                      } else if (isSelected) {
                        containerClass = "border-2 border-red-400 bg-red-100 text-red-800 opacity-70";
                        icon = <XCircle size={20} className="text-red-500" />;
                      } else {
                        containerClass = "border border-gray-100 opacity-50";
                      }
                    }

                    return (
                      <div 
                        key={opt}
                        onClick={() => !showResult && setAnswers({...answers, [q.id]: label})}
                        className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${containerClass}`}
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
                      <HelpCircle size={16} className="text-blue-500"/> Giải thích:
                    </p>
                    {q.explanation || "Không có giải thích chi tiết."}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CSS Animation cho sóng nhạc (Nhúng trực tiếp) */}
      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 10px; }
          50% { height: 30px; }
        }
        .animate-music-bar {
          animation: music-bar 1s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ListeningPractice;