import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, ArrowLeft, Clock, 
  Volume2, Sparkles, Loader2,
  Globe, Lightbulb, Home, Headphones,
  FastForward, Lock, Mic, Info, AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// === CẤU HÌNH ===
const PREP_TIME = 20; // 20 giây chuẩn bị

const ListeningPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { level, topic, testId } = location.state || { level: 'B1', topic: 'daily_life', testId: null };
  
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Audio State (TTS)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isIntroSpeaking, setIsIntroSpeaking] = useState(false);
  const [hasAudioEnded, setHasAudioEnded] = useState(false); // ✅ Đánh dấu đã đọc xong (để chặn nghe lại)
  const [prepTimeLeft, setPrepTimeLeft] = useState(PREP_TIME); 
  const [isPrepPhase, setIsPrepPhase] = useState(true);

  // Quiz State
  const [isStarted, setIsStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 phút mặc định

  // AI State
  const [aiExplanations, setAiExplanations] = useState({}); 
  const [explainingId, setExplainingId] = useState(null); 

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // 1. Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let url = `http://localhost:5000/api/listening/test?level=${level}&topic=${topic}`;
      if (testId) url = `http://localhost:5000/api/listening/test?id=${testId}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Không tìm thấy bài nghe.');
      const data = await response.json();
      setTestData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [level, topic, testId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Cleanup: Dừng đọc khi thoát trang
  useEffect(() => {
    return () => {
      if (synthRef.current) {
          synthRef.current.cancel();
      }
    };
  }, []);

  // --- LOGIC GIỌNG NÓI ---

  const playIntro = useCallback(() => {
    if (!testData) return;
    synthRef.current.cancel();

    const displayTopic = topic.replace('_', ' '); 
    const introText = `Welcome to VSTEP Listening. Level ${level}. Topic: ${displayTopic}. You have ${PREP_TIME} seconds to prepare.`;

    const u = new SpeechSynthesisUtterance(introText);
    u.lang = 'en-US';
    u.rate = 1; 
    
    u.onstart = () => setIsIntroSpeaking(true);
    u.onend = () => setIsIntroSpeaking(false);
    
    synthRef.current.speak(u);
  }, [testData, level, topic]);

  const startMainSpeaking = useCallback(() => {
    if (!testData?.script_content) return;
    synthRef.current.cancel();

    const u = new SpeechSynthesisUtterance(testData.script_content);
    u.lang = 'en-US';
    u.rate = 0.9; 
    
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => {
        setIsSpeaking(false);
        setHasAudioEnded(true); // ✅ QUAN TRỌNG: Đánh dấu đã đọc xong
    };
    
    utteranceRef.current = u;
    synthRef.current.speak(u);
  }, [testData]);

  // Toggle Play/Pause
  const togglePlay = () => {
    if (hasAudioEnded) return; // ✅ CHẶN NGHE LẠI: Nếu đã kết thúc thì không làm gì cả

    if (synthRef.current.speaking) {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsSpeaking(true);
      } else {
        synthRef.current.pause();
        setIsSpeaking(false);
      }
    } else {
        // Chỉ cho phép start nếu chưa kết thúc
        if (!hasAudioEnded) startMainSpeaking();
    }
  };

  // --- FLOW CONTROL ---
  
  const handleStart = () => {
      setIsStarted(true);
      setIsPrepPhase(true);
      playIntro();
  };

  // Đếm ngược Prep Time
  useEffect(() => {
    if (!isStarted || !isPrepPhase || isIntroSpeaking) return;

    const timer = setInterval(() => {
        setPrepTimeLeft(prev => {
            if (prev <= 1) {
                setIsPrepPhase(false);
                startMainSpeaking();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isPrepPhase, isIntroSpeaking, startMainSpeaking]);

  const skipIntro = () => {
      synthRef.current.cancel();
      setIsIntroSpeaking(false);
      setPrepTimeLeft(0);
      setIsPrepPhase(false);
      startMainSpeaking();
  };

  // --- TIMER TỔNG (ĐÃ FIX LỖI) ---
  useEffect(() => {
    // Chỉ chạy timer khi đã bắt đầu làm bài và chưa nộp
    if (!isStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(true); // Hết giờ -> Tự nộp (Force Submit)
            return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isSubmitted]); // Dependency chuẩn, không cần handleSubmit ở đây để tránh loop


  // --- XỬ LÝ NỘP BÀI (VALIDATE) ---
  const handleSubmit = useCallback((force = false) => {
    if (isSubmitted) return;

    // ✅ VALIDATE: Kiểm tra chọn hết đáp án chưa (trừ khi hết giờ - force=true)
    if (!force && testData?.questions) {
        const totalQ = testData.questions.length;
        const answeredQ = Object.keys(answers).length;
        
        if (answeredQ < totalQ) {
            const missingCount = totalQ - answeredQ;
            alert(`⚠️ Bạn còn ${missingCount} câu chưa chọn đáp án! Vui lòng hoàn thành trước khi nộp.`);
            return; // Chặn nộp
        }
    }

    // Xác nhận nộp
    if (force || window.confirm("Bạn chắc chắn muốn nộp bài?")) {
      setIsSubmitted(true);
      setShowResult(true);
      synthRef.current.cancel(); // Dừng đọc ngay
      setIsSpeaking(false);
      setIsIntroSpeaking(false);

      let correctCount = 0;
      if (testData?.questions) {
          testData.questions.forEach(q => { if (answers[q.id] === q.correct) correctCount++; });
      }
      
      const totalQ = testData?.questions?.length || 1;
      const finalScore = Math.round((correctCount / totalQ) * 100) / 10;

      const token = localStorage.getItem('vstep_token');
      if (token) {
        // Map tên hiển thị
        const topicMap = { 'daily_life': 'Đời sống', 'education': 'Giáo dục', 'travel': 'Du lịch', 'technology': 'Công nghệ' };
        const topicName = topicMap[topic] || topic;
        const displayTitle = `${topicName} - ${testData.title || 'Bài tập'}`;

        fetch('http://localhost:5000/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ skill: 'listening', level, score: finalScore, duration: (40 * 60) - timeLeft, testTitle: displayTitle })
        }).catch(e => console.error(e));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSubmitted, testData, answers, level, timeLeft, topic]);


  const handleAnswer = (qId, option) => {
    if (isSubmitted) return;
    if (isPrepPhase) return; 
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleExit = () => {
    if (isSubmitted) { navigate('/practice/listening'); return; }
    if (window.confirm("Thoát sẽ mất kết quả?")) navigate('/practice/listening');
  };

  // ✅ AI Explain (Gửi kèm script content)
  const handleAiExplain = async (qId, qData) => {
    if (aiExplanations[qId]) return;
    setExplainingId(qId);
    try {
      const res = await fetch('http://localhost:5000/api/ai/explain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            question: qData.question, 
            options: qData.options, 
            correct: qData.correct, 
            userAnswer: answers[qId],
            context: testData.script_content // Gửi thêm bài đọc gốc
        })
      });
      const json = await res.json();
      setAiExplanations(prev => ({ ...prev, [qId]: json }));
    } catch (err) { alert("Lỗi AI: " + err.message); } 
    finally { setExplainingId(null); }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  // --- MÀN HÌNH CHỜ ---
  if (!isStarted) {
      return (
        <div className="h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mic className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{testData.title}</h1>
                <p className="text-gray-500 mb-6">Part {testData.part || 1} • {level} • {topic}</p>
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 border border-blue-100 text-left">
                    <p className="font-bold mb-1">⚠️ Quy định thi:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Bạn có <b>{PREP_TIME} giây</b> chuẩn bị.</li>
                        <li>Bài nghe chỉ phát <b>1 LẦN DUY NHẤT</b>.</li>
                        <li>Phải chọn <b>TẤT CẢ</b> đáp án mới được nộp.</li>
                    </ul>
                </div>
                <button onClick={handleStart} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                    <Play className="w-5 h-5 fill-current"/> Bắt đầu ngay
                </button>
            </div>
        </div>
      );
  }

  const correctCount = testData.questions.filter(q => answers[q.id] === q.correct).length;
  const totalQuestions = testData.questions.length;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* CỘT TRÁI: INFO & TRẠNG THÁI */}
      <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col shadow-xl z-20">
         <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
            <button onClick={handleExit}><ArrowLeft size={20} className="text-gray-500"/></button>
            <span className="font-bold text-gray-700">AI Reading Test</span>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-indigo-50/50">
            {/* Vòng tròn trạng thái */}
            <div className={`relative w-64 h-64 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isPrepPhase ? 'bg-orange-50 border-4 border-orange-100' : hasAudioEnded ? 'bg-gray-100 border-4 border-gray-200' : 'bg-indigo-50 border-4 border-indigo-100'}`}>
                {isPrepPhase ? (
                    <div className="text-center animate-pulse">
                        <div className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-2">
                            {isIntroSpeaking ? "Hướng dẫn..." : "Chuẩn bị"}
                        </div>
                        <div className="text-6xl font-black text-orange-600 tabular-nums">
                            {isIntroSpeaking ? <Info size={60} className="mx-auto mb-2 text-orange-400"/> : formatTime(prepTimeLeft)}
                        </div>
                        <button onClick={skipIntro} className="mt-4 px-4 py-1.5 bg-white border border-orange-200 text-orange-600 text-xs font-bold rounded-full hover:bg-orange-100 flex items-center gap-1 mx-auto">
                           <FastForward size={12}/> Bỏ qua
                        </button>
                    </div>
                ) : (
                    <div className="text-center relative z-10">
                        <div className="text-sm font-bold uppercase tracking-widest mb-4">
                            {hasAudioEnded ? <span className="text-red-500">Đã kết thúc</span> : <span className="text-indigo-500">Đang đọc bài...</span>}
                        </div>
                        
                        {/* ✅ Nút Play bị Disable hoàn toàn nếu đã nghe xong */}
                        <button 
                            onClick={togglePlay} 
                            disabled={hasAudioEnded}
                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition mx-auto text-white
                                ${hasAudioEnded ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:scale-110'}
                            `}
                        >
                            {hasAudioEnded ? <Lock size={32} /> : (isSpeaking ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor"/>)}
                        </button>

                        {isSpeaking && <div className="mt-4 flex gap-1 justify-center">
                            {[1,2,3].map(i => <div key={i} className="w-1.5 h-4 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: i*0.1+'s'}}></div>)}
                        </div>}
                        
                        {hasAudioEnded && !isSubmitted && <div className="mt-4 text-xs text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">Không thể nghe lại</div>}
                    </div>
                )}
            </div>

            <div className="text-center px-6">
                <h2 className="font-bold text-gray-800 text-lg mb-2">{testData.title}</h2>
                <p className="text-sm text-gray-500">Hệ thống AI tự động đọc văn bản.</p>
            </div>

            {showResult && (
                <div className="w-full mt-8 bg-white p-5 rounded-2xl shadow-lg border border-green-100 text-center animate-fade-in-up">
                  <div className="text-4xl font-black text-green-600 mb-2">{correctCount}/{totalQuestions}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase">Kết quả bài làm</div>
                </div>
            )}
         </div>
      </div>

      {/* CỘT PHẢI: CÂU HỎI */}
      <div className="flex-1 flex flex-col h-full bg-gray-50">
         <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                {isPrepPhase ? <Lock size={16}/> : <Headphones size={16}/>}
                <span>
                    {isIntroSpeaking ? "Đang giới thiệu bài thi..." : 
                     isPrepPhase ? `Đọc trước câu hỏi (${prepTimeLeft}s)` : "Nghe và chọn đáp án đúng"}
                </span>
            </div>
            
            <div className="flex items-center gap-4">
                {/* TIMER TỔNG */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
                    <Clock size={18} /><span>{formatTime(timeLeft)}</span>
                </div>

                {!isSubmitted && <button onClick={() => handleSubmit(false)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">Nộp bài</button>}
                {isSubmitted && <button onClick={() => navigate('/practice/listening')} className="border px-4 py-2 rounded-lg text-sm font-bold flex gap-2 items-center"><Home size={16}/> Trang chủ</button>}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
               {testData.questions.map((q, idx) => {
                  const isMissed = isSubmitted && !answers[q.id]; // Câu chưa làm (nếu force submit)
                  return (
                  <div key={q.id} className={`bg-white p-6 rounded-2xl border shadow-sm relative transition-all ${isMissed ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}>
                     
                     {/* Overlay khóa khi đang chuẩn bị */}
                     {isPrepPhase && (
                         <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200">
                             <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-400 flex items-center gap-1">
                                 <Clock size={12}/> 
                                 {isIntroSpeaking ? "Nghe hướng dẫn..." : "Đọc trước câu hỏi..."}
                             </div>
                         </div>
                     )}

                     <h3 className="font-bold text-gray-800 mb-4 flex gap-3 text-lg">
                        <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">{idx+1}</span>
                        {q.question}
                        {/* Cảnh báo nếu chưa trả lời (khi xem lại) */}
                        {isMissed && <span className="text-xs text-red-500 font-bold ml-auto flex items-center"><AlertCircle size={12} className="mr-1"/> Chưa trả lời</span>}
                     </h3>

                     <div className="space-y-3 ml-11">
                        {q.options.map(opt => {
                            const label = opt.charAt(0);
                            const isSelected = answers[q.id] === label;
                            let style = "border-gray-200 hover:bg-gray-50";
                            if(isSelected) style = "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-900 font-medium";
                            if(showResult) {
                                if(label === q.correct) style = "bg-green-50 border-green-500 text-green-900 font-bold";
                                else if(isSelected) style = "bg-red-50 border-red-500 text-red-900 opacity-70";
                            }

                            return (
                                <div key={opt} onClick={() => !showResult && handleAnswer(q.id, label)} 
                                     className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${style}`}>
                                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600' : 'border-gray-300'}`}>
                                         {isSelected && <div className="w-2 h-2 bg-indigo-600 rounded-full"/>}
                                     </div>
                                     <span className="text-sm">{opt}</span>
                                </div>
                            )
                        })}
                     </div>
                     
                     {/* AI Explain Area */}
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
               );
               })}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ListeningPractice;