import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, ArrowLeft, Clock, 
  Volume2, Sparkles, Loader2,
  Globe, Lightbulb, Home, Headphones,
  FastForward, Lock, Mic, AlertCircle,
  RotateCcw, CheckCircle2, ListChecks
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// === CẤU HÌNH ===
const PREP_TIME = 20; 

const ListeningPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { level, topic, testId } = location.state || { level: 'B1', topic: 'daily_life', testId: null };
  
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Audio State ---
  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [isIntroSpeaking, setIsIntroSpeaking] = useState(false); 
  const [hasAudioEnded, setHasAudioEnded] = useState(false); 
  const [prepTimeLeft, setPrepTimeLeft] = useState(PREP_TIME); 
  const [isPrepPhase, setIsPrepPhase] = useState(true); 

  // --- Quiz State ---
  const [isStarted, setIsStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60); 

  // --- AI Explain State ---
  const [aiExplanations, setAiExplanations] = useState({}); 
  const [explainingId, setExplainingId] = useState(null); 

  // Refs quản lý Audio
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);
  
  // [QUAN TRỌNG] Ref để theo dõi trạng thái Play/Pause tức thì
  const isPlayingRef = useRef(false); 
  const isCancelledRef = useRef(false);

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
      toast.error("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [level, topic, testId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      isPlayingRef.current = false;
      synthRef.current.cancel();
      if (audioRef.current) {
          try { audioRef.current.pause(); } catch (e) {}
          audioRef.current = null;
      }
    };
  }, []);

  // --- LOGIC PHÂN TÍCH KỊCH BẢN ---
  const parseScript = (fullText) => {
    if (!fullText) return [];
    // Tách dòng và lọc dòng trống
    return fullText.split('\n').map(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return null;

        // Nhận diện giọng Nam/Nữ
        if (cleanLine.match(/^(man:|m:|male:)/i)) {
            return { role: 'male', text: cleanLine.replace(/^(man:|m:|male:)\s*/i, '') };
        } else if (cleanLine.match(/^(woman:|w:|female:)/i)) {
            return { role: 'female', text: cleanLine.replace(/^(woman:|w:|female:)\s*/i, '') };
        } else {
            return { role: 'narrator', text: cleanLine };
        }
    }).filter(item => item !== null);
  };

  // --- LOGIC PHÁT HỘI THOẠI (FIX LỖI DỪNG ĐỌC) ---
  const playDialogue = (scriptArray, index = 0) => {
    // Kiểm tra Ref thay vì State để đảm bảo giá trị luôn mới nhất
    if (isCancelledRef.current || !isPlayingRef.current) return;

    // Hết kịch bản -> Dừng
    if (index >= scriptArray.length) {
        setIsSpeaking(false);
        isPlayingRef.current = false;
        if (!isSubmitted) {
            setHasAudioEnded(true);
            toast("Bài nghe đã kết thúc!", { icon: '🔔' });
        }
        return;
    }

    const currentLine = scriptArray[index];
    const u = new SpeechSynthesisUtterance(currentLine.text);
    
    // Chọn giọng
    const voices = synthRef.current.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Female')) || voices[0];
    const maleVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Male')) || voices[1] || voices[0];

    if (currentLine.role === 'female') {
        u.voice = femaleVoice;
        u.pitch = 1.1; 
        u.rate = 0.9;
    } else if (currentLine.role === 'male') {
        u.voice = maleVoice;
        u.pitch = 0.9;
        u.rate = 0.9;
    } else {
        u.voice = femaleVoice;
        u.rate = 0.95;
    }

    u.lang = 'en-US';

    // Sự kiện khi đọc xong câu hiện tại
    u.onend = () => {
        // [QUAN TRỌNG] Kiểm tra lại Ref trước khi đọc câu tiếp theo
        if (!isCancelledRef.current && isPlayingRef.current) { 
             setTimeout(() => playDialogue(scriptArray, index + 1), 200); // Nghỉ 200ms giữa các câu
        }
    };

    // [FIX LỖI CHROME] Gán biến vào window để tránh Garbage Collection dọn mất
    window.currentUtterance = u;
    
    utteranceRef.current = u;
    synthRef.current.speak(u);
  };

  // 1. Đọc Intro
  const playIntro = useCallback(() => {
    if (!testData) return;
    synthRef.current.cancel();
    isCancelledRef.current = false;
    isPlayingRef.current = true; // Đánh dấu đang active

    const displayTopic = topic ? topic.replace('_', ' ') : 'General'; 
    const introText = `In this part, you will hear eight short announcements or instructions.
  There is one question for each announcement or instruction.
  For each question, choose the right answer A, B, C, or D.
  Then on the answer sheet, find the number of the question and fill in the space that corresponds to the letter of the answer you have chosen.

  We are ready to start.
  First, you have some time to look at questions 1 to 8.`;
    
    const u = new SpeechSynthesisUtterance(introText);
    u.lang = 'en-US';
    u.rate = 1; 
    u.onstart = () => setIsIntroSpeaking(true);
    u.onend = () => setIsIntroSpeaking(false);
    
    synthRef.current.speak(u);
  }, [testData, level, topic]);

  // 2. Bắt đầu bài nghe chính (ưu tiên MP3 nếu có, fallback AI đọc script)
  const startMainSpeaking = useCallback(() => {
    // 1. Trường hợp có file MP3 (Ưu tiên)
    if (testData?.audio_url) {
        if (!audioRef.current) {
            audioRef.current = new Audio(testData.audio_url);
            audioRef.current.onended = () => {
                setIsSpeaking(false);
                isPlayingRef.current = false;
                setHasAudioEnded(true);
                toast("Bài nghe đã kết thúc!", { icon: '🔔' });
            };
        }
        try { audioRef.current.play(); } catch (e) {}
        setIsSpeaking(true);
        isPlayingRef.current = true;
        return;
    }

    // 2. Trường hợp dùng AI đọc Script (Fallback)
    if (testData?.script_content) {
        synthRef.current.cancel();
        isCancelledRef.current = false;
        isPlayingRef.current = true; 
        setIsSpeaking(true);
        const dialogueScript = parseScript(testData.script_content);
        playDialogue(dialogueScript, 0);
    }
  }, [testData, isSubmitted]);

  // 3. Nút Play/Pause
    const togglePlay = () => {
    if (!isSubmitted) {
      if (hasAudioEnded) {
        toast.error("Chỉ được nghe 1 lần!", { icon: '🔒' });
        return;
      }
      if (isSpeaking) {
        toast("Không thể dừng khi đang thi!", { icon: '🚫' });
        return; 
      }
      startMainSpeaking();
    } else {
      // XEM LẠI (REVIEW MODE)
      if (testData?.audio_url && audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play();
          setIsSpeaking(true);
        } else {
          audioRef.current.pause();
          setIsSpeaking(false);
        }
      } else {
        // Logic cho AI cũ
        if (synthRef.current.speaking) {
          if (synthRef.current.paused) { synthRef.current.resume(); setIsSpeaking(true); }
          else { synthRef.current.pause(); setIsSpeaking(false); }
        } else { startMainSpeaking(); }
      }
    }
    };

  // --- FLOW CONTROL ---
  const handleStart = () => {
      setIsStarted(true);
      setIsPrepPhase(true);
      playIntro();
      toast.success("Bắt đầu bài thi!");
  };

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
      toast("Đã bỏ qua hướng dẫn");
  };

  const handleSubmit = useCallback((force = false) => {
    if (isSubmitted) return;

    if (!force && testData?.questions) {
        const totalQ = testData.questions.length;
        const answeredQ = Object.keys(answers).length;
        if (answeredQ < totalQ) {
            toast.error(`⚠️ Còn ${totalQ - answeredQ} câu chưa chọn!`, { duration: 3000 });
            return;
        }
    }

    const processSubmit = () => {
        setIsSubmitted(true);
        setShowResult(true);
        
        // Stop Audio hoàn toàn
        isCancelledRef.current = true; 
        isPlayingRef.current = false;
        synthRef.current.cancel();
        
        setIsSpeaking(false);
        setIsIntroSpeaking(false);
        setHasAudioEnded(false); 

        // Tính điểm
        let correctCount = 0;
        testData.questions.forEach(q => { if (answers[q.id] === q.correct) correctCount++; });
        const finalScore = Math.round((correctCount / testData.questions.length) * 100) / 10;

        const token = localStorage.getItem('vstep_token');
        if (token) {
            const topicName = topic ? topic.replace('_', ' ') : 'General';
            const displayTitle = `${topicName} - ${testData.title || 'Bài tập'}`;
            fetch('http://localhost:5000/api/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ skill: 'listening', level, score: finalScore, duration: (40 * 60) - timeLeft, testTitle: displayTitle })
            }).then(() => toast.success(`Đã nộp bài: ${finalScore}/10 điểm!`));
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (force) processSubmit();
    else toast((t) => (
        <div className="flex flex-col gap-2">
            <span className="font-bold">Nộp bài ngay?</span>
            <div className="flex gap-2">
                <button onClick={() => { toast.dismiss(t.id); processSubmit(); }} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-indigo-700">Nộp luôn</button>
                <button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">Xem lại</button>
            </div>
        </div>
    ), { duration: 5000, icon: '❓' });

  }, [isSubmitted, testData, answers, level, timeLeft, topic]);

  useEffect(() => {
    if (!isStarted || isSubmitted) return;
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isStarted, isSubmitted]);

  useEffect(() => {
      if (timeLeft === 0 && isStarted && !isSubmitted) {
          handleSubmit(true);
          toast("Hết giờ làm bài!", { icon: '⏰' });
      }
  }, [timeLeft, isStarted, isSubmitted, handleSubmit]);

  const handleAnswer = (qId, option) => {
    if (isSubmitted) return;
    if (isPrepPhase) {
        toast("Vui lòng đợi hết thời gian chuẩn bị!", { icon: '⏳' });
        return; 
    }
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleExit = () => {
    if (isSubmitted) { navigate('/practice/listening'); return; }
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-bold text-red-600">Thoát sẽ mất kết quả?</span>
        <div className="flex gap-2">
          <button onClick={() => { toast.dismiss(t.id); navigate('/practice/listening'); }} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">Thoát</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 px-3 py-1 rounded text-sm">Ở lại</button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  const handleAiExplain = async (qId, qData) => {
    if (aiExplanations[qId]) return;
    setExplainingId(qId);
    try {
      const res = await fetch('http://localhost:5000/api/ai/explain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: qData.question, options: qData.options, correct: qData.correct, userAnswer: answers[qId], context: testData.script_content })
      });
      const json = await res.json();
      setAiExplanations(prev => ({ ...prev, [qId]: json }));
    } catch (err) { toast.error("Lỗi Trợ lí AI"); } 
    finally { setExplainingId(null); }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  if (!isStarted) {
      return (
        <div className="h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"><Mic className="w-10 h-10" /></div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{testData.title}</h1>
                <p className="text-gray-500 mb-6">Part {testData.part || '1'} • {level} • {topic}</p>
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 border border-blue-100 text-left">
                    <p className="font-bold mb-1">⚠️ Quy định thi:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Chuẩn bị: <b>{PREP_TIME} giây</b>.</li>
                        <li>Nghe: <b>1 LẦN DUY NHẤT</b> (Giọng Nam/Nữ hội thoại).</li>
                        <li>Phải chọn <b>TẤT CẢ</b> đáp án mới được nộp.</li>
                    </ul>
                </div>
                <button onClick={handleStart} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"><Play className="w-5 h-5 fill-current"/> Bắt đầu ngay</button>
            </div>
        </div>
      );
  }

  const correctCount = testData.questions.filter(q => answers[q.id] === q.correct).length;
  const totalQuestions = testData.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* CỘT TRÁI: PLAYER & STATUS */}
      <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col shadow-xl z-20">
         <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
            <button onClick={handleExit}><ArrowLeft size={20} className="text-gray-500 hover:text-red-500 transition"/></button>
            <span className="font-bold text-gray-700">Listening Test</span>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-indigo-50/50">
            {/* HÌNH CHỮ NHẬT TRẠNG THÁI */}
            <div className={`relative w-full aspect-[4/3] max-h-80 rounded-3xl flex flex-col items-center justify-center mb-8 transition-all duration-500 shadow-sm border-2
                ${isPrepPhase ? 'bg-orange-50 border-orange-200' : 
                  (isSubmitted ? 'bg-green-50 border-green-200' : 
                  (hasAudioEnded ? 'bg-gray-100 border-gray-200' : 
                  (isSpeaking ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-indigo-100')))}`}>
                
                {isPrepPhase ? (
                    <div className="text-center animate-pulse w-full px-6">
                        <div className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-2">
                            {isIntroSpeaking ? "Đang hướng dẫn..." : "Chuẩn bị"}
                        </div>
                        <div className="text-7xl font-black text-orange-600 tabular-nums mb-4">
                            {formatTime(prepTimeLeft)}
                        </div>
                        
                        {/* HIỂN THỊ DỊCH TIẾNG VIỆT */}
                        {isIntroSpeaking && (
                            <div className="bg-orange-100/50 p-3 rounded-xl border border-orange-200/50 mb-4 animate-fade-in">
                                <p className="text-orange-800 text-sm italic font-medium">
                                    "Chào mừng đến với bài thi Nghe VSTEP. Bạn có {PREP_TIME} giây để đọc trước câu hỏi."
                                </p>
                            </div>
                        )}

                        <button onClick={skipIntro} className="px-5 py-2 bg-white border border-orange-200 text-orange-600 text-sm font-bold rounded-xl hover:bg-orange-100 flex items-center gap-2 mx-auto shadow-sm">
                           <FastForward size={14}/> Bỏ qua
                        </button>
                    </div>
                ) : (
                    <div className="text-center relative z-10 w-full px-6">
                        {/* Label trạng thái */}
                        <div className="text-sm font-bold uppercase tracking-widest mb-6">
                            {isSubmitted ? <span className="text-green-600 flex items-center gap-1 justify-center bg-green-100 py-1 px-3 rounded-full w-fit mx-auto"><CheckCircle2 size={14}/> Xem lại</span> : 
                             (hasAudioEnded ? <span className="text-red-500 flex items-center gap-1 justify-center bg-red-100 py-1 px-3 rounded-full w-fit mx-auto"><Lock size={14}/> Đã kết thúc</span> : 
                             (isSpeaking ? <span className="text-indigo-600 flex items-center gap-1 justify-center bg-indigo-100 py-1 px-3 rounded-full w-fit mx-auto"><Volume2 size={14}/> Đang phát...</span> : <span className="text-gray-500">Sẵn sàng</span>))}
                        </div>
                        
                        {/* Nút Play/Pause Lớn */}
                        <button 
                            onClick={togglePlay} 
                            className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg transition-all mx-auto text-white transform active:scale-95
                                ${!isSubmitted && hasAudioEnded ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed' : 
                                  (!isSubmitted && isSpeaking ? 'bg-indigo-400 hover:bg-indigo-500 cursor-not-allowed' : 'bg-indigo-600 hover:scale-105 hover:shadow-indigo-300')}
                            `}
                        >
                            {!isSubmitted && hasAudioEnded ? <Lock size={40} /> : 
                             (!isSubmitted && isSpeaking ? <Pause size={40} className="opacity-50" /> : 
                             (isSpeaking ? <Pause size={40} fill="currentColor"/> : 
                             (isSubmitted ? <RotateCcw size={40} /> : <Play size={40} fill="currentColor"/>)))}
                        </button>

                        {/* Thanh sóng nhạc */}
                        {isSpeaking && <div className="mt-6 flex gap-1.5 justify-center h-6 items-end">
                            {[1,2,3,4,5,6,7].map(i => <div key={i} className="w-1.5 bg-indigo-400 rounded-full animate-music" style={{animationDelay: i*0.1+'s', height: Math.random()*24+6+'px'}}></div>)}
                        </div>}
                        
                        {!isSubmitted && isSpeaking && <p className="text-xs text-indigo-400 mt-4 font-bold animate-pulse uppercase tracking-wide">Không thể dừng</p>}
                    </div>
                )}
            </div>

            {/* Các phần UI khác giữ nguyên */}
            <div className="text-center px-6">
                <h2 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{testData.title}</h2>
                <p className="text-sm text-gray-500">
                    {isSubmitted ? "Bạn có thể nghe lại bao nhiêu lần tùy thích." : "Lưu ý: Audio chỉ phát 1 lần duy nhất."}
                </p>
            </div>

            {showResult && (
                <div className="w-full mt-8 bg-white p-5 rounded-2xl shadow-lg border border-green-100 text-center animate-fade-in-up">
                  <div className="text-4xl font-black text-green-600 mb-2">{correctCount}/{totalQuestions}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase">Kết quả bài làm</div>
                </div>
            )}
         </div>
      </div>

      {/* CỘT PHẢI: QUESTIONS (Giữ nguyên) */}
      <div className="flex-1 flex flex-col h-full bg-gray-50">
         <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                {isPrepPhase ? <Lock size={18} className="text-orange-500"/> : <Headphones size={18} className="text-indigo-600"/>}
                <span className={isPrepPhase ? "text-orange-600 font-bold" : ""}>
                    {isIntroSpeaking ? "Đang đọc hướng dẫn..." : 
                     isPrepPhase ? `Thời gian đọc trước` : "Nghe và chọn đáp án"}
                </span>
            </div>
            
            <div className="flex items-center gap-6">
                {/* [MỚI] UI SỐ CÂU ĐÃ LÀM */}
                {!isSubmitted && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium text-sm border border-indigo-100">
                        <ListChecks size={16} />
                        <span>Đã làm: <b className={answeredCount === totalQuestions ? "text-green-600" : ""}>{answeredCount}</b>/{totalQuestions}</span>
                    </div>
                )}

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
                    <Clock size={18} /><span>{formatTime(timeLeft)}</span>
                </div>

                {!isSubmitted && <button onClick={() => handleSubmit(false)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md">Nộp bài</button>}
                {isSubmitted && <button onClick={() => navigate('/practice/listening')} className="border px-4 py-2 rounded-lg text-sm font-bold flex gap-2 items-center hover:bg-gray-50 transition"><Home size={16}/> Trang chủ</button>}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
               {testData.questions.map((q, idx) => {
                  const isMissed = isSubmitted && !answers[q.id]; 
                  return (
                  <div key={q.id} className={`bg-white p-6 rounded-2xl border shadow-sm relative transition-all ${isMissed ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}>
                      {isPrepPhase && (
                          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 pointer-events-none">
                          </div>
                      )}
                      
                      <h3 className="font-bold text-gray-800 mb-4 flex gap-3 text-lg">
                        <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">{idx+1}</span>
                        {q.question || q.question_text}
                        {isMissed && <span className="text-xs text-red-500 font-bold ml-auto flex items-center"><AlertCircle size={12} className="mr-1"/> Chưa trả lời</span>}
                      </h3>
                      <div className="space-y-3 ml-11">
                        {q.options.map(opt => {
                            const label = ['A', 'B', 'C', 'D'][q.options.indexOf(opt)] || 'A'; 
                            const isSelected = answers[q.id] === label;
                            let style = "border-gray-200 hover:bg-gray-50";
                            if(isSelected) style = "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-900 font-medium";
                            
                            if(showResult) {
                                if(label === q.correct || label === q.correct_answer) style = "bg-green-50 border-green-500 text-green-900 font-bold";
                                else if(isSelected) style = "bg-red-50 border-red-500 text-red-900 opacity-70";
                            }

                            return (
                                <div key={opt} onClick={() => !showResult && handleAnswer(q.id, label)} 
                                     className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${style}`}>
                                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600' : 'border-gray-300'}`}>
                                         {isSelected && <div className="w-2 h-2 bg-indigo-600 rounded-full"/>}
                                     </div>
                                     <span className="text-sm font-bold text-gray-500 w-4">{label}.</span>
                                     <span className="text-sm">{opt}</span>
                                </div>
                            )
                        })}
                      </div>
                      
                      {showResult && (
                      <div className="mt-6 ml-11 pt-4 border-t border-dashed border-gray-200">
                        {aiExplanations[q.id] ? (
                          <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 animate-fade-in">
                            <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold text-sm uppercase"><Sparkles className="w-4 h-4" /> Trợ lí AI giải thích</div>
                            <div className="space-y-3">
                                <div><span className="text-xs font-bold text-gray-500 uppercase flex gap-1 mb-1"><Globe size={12}/> Dịch</span><p className="text-gray-800 italic text-sm break-words whitespace-pre-wrap">{typeof aiExplanations[q.id].translation === 'string' ? aiExplanations[q.id].translation : "..."}</p></div>
                                <div><span className="text-xs font-bold text-gray-500 uppercase flex gap-1 mb-1"><Lightbulb size={12}/> Giải thích</span><p className="text-gray-800 text-sm break-words whitespace-pre-wrap">{typeof aiExplanations[q.id].explanation === 'string' ? aiExplanations[q.id].explanation : "..."}</p></div>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => handleAiExplain(q.id, q)} disabled={explainingId === q.id} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all">
                            {explainingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {explainingId === q.id ? "Đang suy nghĩ..." : "Giải thích bằng Trợ lí AI"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
               )})}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ListeningPractice;