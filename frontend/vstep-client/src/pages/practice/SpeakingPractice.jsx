import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Square, Play, ChevronRight, Loader2, Sparkles,
  ArrowLeft, CheckCircle2, Volume2, Clock, Moon, Sun, AlertTriangle, RefreshCcw
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const SpeakingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { part = '1', topic = 'daily_life', testId = null } = location.state || {}; 

  const [testData, setTestData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Flow State
  const [isStarted, setIsStarted] = useState(false);
  const [step, setStep] = useState('prep'); // prep -> recording -> review
  
  // Timer State
  const [prepTime, setPrepTime] = useState(part === '1' ? 30 : 60);
  const [speakTime, setSpeakTime] = useState(part === '1' ? 180 : 240);
  const [totalSpeakTime, setTotalSpeakTime] = useState(0); 
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [transcript, setTranscript] = useState(""); 

  // 1. FETCH DATA
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        let url = `http://localhost:5000/api/speaking/test?part=${part}&topic=${topic}`;
        if (testId) url = `http://localhost:5000/api/speaking/test?id=${testId}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Không tìm thấy câu hỏi Speaking.");
        const data = await res.json();
        setTestData(data); 
      } catch (err) {
        setError(err.message);
        toast.error("Lỗi tải đề thi: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [part, topic, testId]);

  // 2. TIMER LOGIC
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isStarted && step !== 'review') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    if (!isStarted || step === 'review') return;
    
    const timer = setInterval(() => {
      if (step === 'prep') {
        setPrepTime(prev => {
          if (prev <= 0) {
            setStep('recording');
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      } else if (step === 'recording') {
        setSpeakTime(prev => {
          if (prev <= 0) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStarted, step]);

  // 3. EXIT HANDLER
  const handleExit = () => {
    if (!isStarted || step === 'review') {
      navigate('/practice/speaking');
      return;
    }
    
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-bold text-red-600">Thoát sẽ mất bài làm?</span>
        <div className="flex gap-2">
          <button 
            onClick={() => { 
                toast.dismiss(t.id); 
                if (isRecording) stopRecording();
                navigate('/practice/speaking'); 
            }}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold"
          >
            Thoát luôn
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 px-3 py-1 rounded text-sm text-gray-800"
          >
            Ở lại
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  // 4. RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        setTotalSpeakTime(duration);

        setStep('review');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());

        setTranscript("Well, honestly I think this is a very interesting topic. In my opinion, learning English opens up many opportunities for career advancement. However, it requires a lot of practice and dedication."); 
        
        toast.success("Đã lưu bản ghi âm!", { icon: '🎤' });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStep('recording');
      toast("Đang ghi âm... Hãy nói to rõ!", { icon: '🔴' });

    } catch (err) {
      toast.error("Lỗi Mic: Vui lòng cho phép truy cập micro.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // 5. AI ANALYZE
  const handleAnalyze = async () => {
    if(!transcript) return;
    setIsAnalyzing(true);

    try {
        const res = await fetch('http://localhost:5000/api/speaking/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                topic: testData?.question_text, 
                transcript: transcript, 
                part: part 
            })
        });
        const feedbackData = await res.json();
        
        if(!res.ok) throw new Error(feedbackData.message || "Lỗi chấm điểm");
        
        setAiFeedback(feedbackData);
        toast.success(`Đã có kết quả: ${feedbackData.score}/10 điểm!`, { duration: 5000 });

        const token = localStorage.getItem('vstep_token');
        if (token) {
            await fetch('http://localhost:5000/api/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    skill: 'speaking', 
                    level: 'B1', 
                    score: feedbackData.score, 
                    duration: totalSpeakTime,
                    testTitle: `Speaking Part ${part} - ${testData?.title}`,
                    bai_lam_text: transcript,
                    ai_feedback: feedbackData
                })
            });
        }

    } catch (err) {
        toast.error("Lỗi phân tích: " + err.message);
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-orange-600"/></div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 bg-slate-50">{error}</div>;

  // --- START SCREEN ---
  if (!isStarted) {
    return (
      <div className={`h-screen flex items-center justify-center p-4 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-3xl shadow-2xl border text-center transition-all duration-300 transform hover:scale-[1.01] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
          <div className="flex justify-end mb-4">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
             </button>
          </div>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
            <Mic className="w-12 h-12" />
          </div>
          <h1 className={`text-3xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Speaking Part {part}</h1>
          <p className={`mb-8 font-medium py-1.5 px-4 rounded-full inline-block text-sm uppercase tracking-wide ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
            Topic: {topic ? topic.replace('_', ' ') : 'General'}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Chuẩn bị</p>
                <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{part === '1' ? '30' : '60'}s</p>
             </div>
             <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Thời gian nói</p>
                <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{part === '1' ? '3' : '4'}m</p>
             </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => navigate('/practice/speaking')} className={`flex-1 py-3.5 rounded-xl font-bold transition ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Hủy bỏ</button>
             <button onClick={() => setIsStarted(true)} className="flex-[2] py-3.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                Bắt đầu thi <ChevronRight size={20}/>
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN INTERFACE (SPLIT VIEW) ---
  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* HEADER */}
      <header className={`h-16 flex-shrink-0 flex items-center justify-between px-6 border-b z-30 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <button onClick={handleExit} className={`p-2 rounded-full transition ${isDarkMode ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'}`}>
           <ArrowLeft size={20}/>
        </button>
        
        <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
           <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : (step==='prep' ? 'bg-yellow-500' : 'bg-green-500')}`}></div>
           <span className={`font-bold text-xs uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
             {step === 'prep' ? 'Chuẩn bị' : step === 'recording' ? 'Đang Ghi Âm' : 'Xem lại kết quả'}
           </span>
        </div>
        
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
      </header>

      {/* BODY - SPLIT LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* --- LEFT COLUMN: QUESTION (SCROLLABLE) --- */}
        <div className={`flex-1 lg:w-1/2 h-full relative overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r transition-colors duration-300 ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <div className="p-6 lg:p-10 max-w-3xl mx-auto">
                <h3 className={`font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2 sticky top-0 py-2 z-10 backdrop-blur-sm ${isDarkMode ? 'text-orange-400 bg-slate-900/90' : 'text-slate-400 bg-white/90'}`}>
                    <Volume2 size={16}/> Câu hỏi của bạn
                </h3>
                
                <div 
                    className={`prose prose-lg lg:prose-xl font-medium leading-relaxed ${isDarkMode ? 'prose-invert text-slate-200' : 'prose-slate text-slate-700'}`}
                    style={{whiteSpace: 'pre-line'}}
                    dangerouslySetInnerHTML={{ __html: testData?.question_text }}
                />
            </div>
        </div>

        {/* --- RIGHT COLUMN: CONTROLS (FIXED/CENTERED) --- */}
        <div className={`flex-1 lg:w-1/2 h-full relative flex flex-col items-center justify-center p-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            
            {/* Visualizer Background (Chỉ hiện ở cột phải) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className={`absolute w-[300px] h-[300px] border rounded-full transition-all duration-[2000ms] ${isRecording ? 'scale-150 opacity-10' : 'scale-50 opacity-0'} ${isDarkMode ? 'border-orange-400' : 'border-orange-500'}`}></div>
                <div className={`absolute w-[500px] h-[500px] border rounded-full transition-all duration-[3000ms] delay-75 ${isRecording ? 'scale-125 opacity-5' : 'scale-50 opacity-0'} ${isDarkMode ? 'border-orange-400' : 'border-orange-500'}`}></div>
            </div>

            <div className="z-10 w-full max-w-md flex flex-col items-center">
                
                {/* 1. CLOCK */}
                {step !== 'review' && (
                    <div className="mb-10 text-center animate-fade-in">
                        <div className={`text-8xl font-black font-mono tracking-tighter tabular-nums transition-colors ${step === 'recording' && speakTime < 30 ? 'text-red-500 animate-pulse' : (isDarkMode ? 'text-white' : 'text-slate-800')}`}>
                            {step === 'prep' ? `00:${prepTime < 10 ? '0'+prepTime : prepTime}` : 
                            `${Math.floor(speakTime/60)}:${(speakTime%60).toString().padStart(2,'0')}`}
                        </div>
                        <p className={`text-sm mt-2 uppercase font-bold tracking-[0.3em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {step === 'prep' ? 'Thời gian suy nghĩ' : 'Thời gian trả lời'}
                        </p>
                    </div>
                )}

                {/* 2. ACTION BUTTONS */}
                {step === 'prep' && (
                    <button onClick={() => { setStep('recording'); startRecording(); }} className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95 text-lg">
                        <Mic size={28}/> Bắt đầu nói ngay
                    </button>
                )}

                {step === 'recording' && (
                    <div className="relative group">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 group-hover:opacity-30"></div>
                        <button onClick={stopRecording} className="relative z-10 w-28 h-28 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-90">
                            <Square size={40} fill="currentColor" className="rounded-md" />
                        </button>
                        <p className={`mt-6 text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bấm để dừng</p>
                    </div>
                )}

                {/* 3. REVIEW PANEL */}
                {step === 'review' && (
                    <div className={`w-full p-6 rounded-3xl shadow-xl border animate-fade-in-up transition-colors duration-300 max-h-[500px] overflow-y-auto ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
                        <div className={`p-4 rounded-2xl border mb-6 flex items-center gap-4 transition-colors ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                            <button onClick={() => new Audio(audioUrl).play()} className={`p-3 border rounded-full transition shadow-sm active:scale-95 ${isDarkMode ? 'bg-slate-600 border-slate-500 text-white hover:bg-slate-500' : 'bg-white border-slate-200 text-orange-600 hover:bg-slate-100'}`}>
                                <Play size={20} fill="currentColor"/>
                            </button>
                            <div className="flex-1">
                                <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                                    <div className="w-full h-full bg-orange-500 opacity-80"></div>
                                </div>
                                <p className={`text-xs mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Độ dài: {totalSpeakTime}s</p>
                            </div>
                        </div>

                        {!aiFeedback ? (
                            <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-70">
                                {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles className="w-5 h-5"/>}
                                {isAnalyzing ? "Trợ lí AI đang chấm điểm..." : "Chấm điểm ngay"}
                            </button>
                        ) : (
                            <div className={`p-5 rounded-2xl border animate-fade-in ${isDarkMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100'}`}>
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-dashed border-indigo-200/50">
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Điểm số</span>
                                    <span className={`text-4xl font-black ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{aiFeedback.score}<span className="text-xl text-indigo-400 font-normal">/10</span></span>
                                </div>
                                <div className={`text-sm mb-4 p-4 rounded-xl leading-relaxed ${isDarkMode ? 'bg-slate-900/50 text-slate-300' : 'bg-white/60 text-slate-700'}`}>
                                    <strong className="block mb-1 text-indigo-500">Nhận xét:</strong> {aiFeedback.comment}
                                </div>
                                {aiFeedback.better_response && (
                                    <div className={`text-sm mb-4 p-4 rounded-xl border-l-4 border-emerald-500 leading-relaxed ${isDarkMode ? 'bg-slate-900/50 text-emerald-100' : 'bg-emerald-50 text-emerald-900'}`}>
                                        <strong className="block mb-1 text-emerald-600">Gợi ý trả lời hay hơn:</strong>
                                        <span className="italic opacity-90">"{aiFeedback.better_response}"</span>
                                    </div>
                                )}
                                <div className="mt-4 flex gap-3">
                                    <button onClick={() => window.location.reload()} className={`flex-1 py-2.5 border rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
                                        <RefreshCcw size={16}/> Làm lại
                                    </button>
                                    <button onClick={() => navigate('/practice/speaking')} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md">
                                        Hoàn thành
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default SpeakingPractice;