import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Square, Play, ChevronRight, Loader2, Sparkles,
  ArrowLeft, CheckCircle2, Volume2, Clock, Moon, Sun, AlertTriangle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SpeakingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy dữ liệu (Thêm testId)
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
  const [totalSpeakTime, setTotalSpeakTime] = useState(0); // Thời gian thực tế đã nói
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [transcript, setTranscript] = useState(""); // Văn bản chuyển từ giọng nói

  // 1. FETCH DATA (Có hỗ trợ testId)
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
    if (window.confirm("Thoát sẽ mất bài làm. Bạn chắc chứ?")) {
      if (isRecording) stopRecording();
      navigate('/practice/speaking');
    }
  };

  // 4. RECORDING (Web Audio API)
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
        
        // Tính thời gian đã nói
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        setTotalSpeakTime(duration);

        setStep('review');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());

        // GIẢ LẬP SPEECH-TO-TEXT (Vì trình duyệt không hỗ trợ sẵn API này tốt)
        // Trong thực tế, bạn sẽ gửi File Blob lên server, server dùng Whisper để transcode
        setTranscript("I think that... well, this topic is very interesting. In my opinion, online learning is convenient because I can study anywhere. However, I sometimes miss talking to my friends face-to-face. So, it has both pros and cons."); 
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStep('recording');
    } catch (err) {
      alert("Lỗi Mic: Vui lòng cho phép truy cập micro.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // 5. AI ANALYZE & SAVE
  const handleAnalyze = async () => {
    if(!transcript) return;
    setIsAnalyzing(true);

    try {
        // 1. Gọi AI Chấm điểm
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

        // 2. Lưu kết quả
        const token = localStorage.getItem('vstep_token');
        if (token) {
            await fetch('http://localhost:5000/api/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    skill: 'speaking', 
                    level: 'B1', // Mặc định hoặc lấy từ user
                    score: feedbackData.score, 
                    duration: totalSpeakTime,
                    testTitle: `Speaking Part ${part} - ${testData?.title}`,
                    bai_lam_text: transcript, // Lưu văn bản nói
                    ai_feedback: feedbackData
                })
            });
        }

    } catch (err) {
        alert("Lỗi: " + err.message);
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-orange-600"/></div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 bg-slate-50">{error}</div>;

  // --- START SCREEN ---
  if (!isStarted) {
    return (
      <div className={`h-screen flex items-center justify-center p-4 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
        <div className={`max-w-lg w-full p-8 rounded-2xl shadow-xl border text-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          
          <div className="flex justify-end mb-2">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
             </button>
          </div>

          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
            <Mic className="w-10 h-10" />
          </div>
          
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Speaking Part {part}</h1>
          <p className={`mb-8 font-medium py-1 px-3 rounded-full inline-block text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
            Topic: {topic.replace('_', ' ').toUpperCase()}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Chuẩn bị</p>
                <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{part === '1' ? '30' : '60'}s</p>
             </div>
             <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Thời gian nói</p>
                <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{part === '1' ? '3' : '4'} phút</p>
             </div>
          </div>

          <div className="flex gap-3">
             <button onClick={() => navigate('/practice/speaking')} className={`flex-1 py-3 rounded-xl font-bold transition ${isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>Hủy</button>
             <button onClick={() => setIsStarted(true)} className="flex-[2] py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2">
                Bắt đầu thi <ChevronRight size={20}/>
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN INTERFACE ---
  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* HEADER */}
      <header className={`h-16 flex items-center justify-between px-6 border-b z-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/80 border-slate-700 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
        <button onClick={handleExit} className={`p-2 rounded-full transition ${isDarkMode ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'}`}>
           <ArrowLeft size={20}/>
        </button>
        
        <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
           <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></div>
           <span className={`font-bold text-xs uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
             {step === 'prep' ? 'Chuẩn bị' : step === 'recording' ? 'Đang Ghi Âm' : 'Xem lại'}
           </span>
        </div>
        
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
      </header>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
        
        {/* Visualizer Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className={`w-96 h-96 border rounded-full transition-all duration-1000 ${isRecording ? 'animate-ping opacity-20' : 'opacity-5'} ${isDarkMode ? 'border-white' : 'border-orange-500'}`}></div>
           <div className={`w-[500px] h-[500px] border rounded-full absolute transition-all duration-1000 ${isRecording ? 'animate-ping opacity-10' : 'opacity-0'} ${isDarkMode ? 'border-white' : 'border-orange-500'}`} style={{animationDuration: '4s'}}></div>
        </div>

        {/* QUESTION CARD */}
        <div className={`z-10 w-full max-w-3xl p-10 rounded-2xl mb-10 text-center transition-all duration-300 ${isDarkMode ? 'bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl' : 'bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>
           <h3 className={`font-bold text-xs uppercase tracking-widest mb-6 flex items-center justify-center gap-2 ${isDarkMode ? 'text-orange-300' : 'text-slate-400'}`}>
             <Volume2 size={16}/> Câu hỏi của bạn
           </h3>
           
           <div 
             className={`prose prose-lg mx-auto font-medium leading-relaxed ${isDarkMode ? 'prose-invert text-white' : 'prose-slate text-slate-800'}`}
             style={{whiteSpace: 'pre-line'}}
             dangerouslySetInnerHTML={{ __html: testData?.question_text }}
           />
        </div>

        {/* CONTROLS AREA */}
        <div className="z-10 flex flex-col items-center w-full max-w-md">
           
           {/* Đồng hồ đếm ngược */}
           {step !== 'review' && (
             <div className="mb-8 text-center">
                <div className={`text-6xl font-black font-mono tracking-tight ${step === 'recording' && speakTime < 30 ? 'text-red-500 animate-pulse' : (isDarkMode ? 'text-white' : 'text-slate-800')}`}>
                   {step === 'prep' ? `00:${prepTime < 10 ? '0'+prepTime : prepTime}` : 
                    `${Math.floor(speakTime/60)}:${(speakTime%60).toString().padStart(2,'0')}`}
                </div>
                <p className={`text-xs mt-2 uppercase font-bold tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  {step === 'prep' ? 'Thời gian suy nghĩ' : 'Thời gian trả lời'}
                </p>
             </div>
           )}

           {/* Nút hành động chính */}
           {step === 'prep' && (
             <button onClick={() => { setStep('recording'); startRecording(); }} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1">
                <Mic size={24}/> Trả lời ngay
             </button>
           )}

           {step === 'recording' && (
             <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75"></div>
                <button onClick={stopRecording} className="relative z-10 w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105">
                    <Square size={32} fill="currentColor" />
                </button>
             </div>
           )}

           {/* Màn hình Review */}
           {step === 'review' && (
             <div className={`w-full p-6 rounded-2xl shadow-xl border animate-fade-in-up transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <h4 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  <CheckCircle2 className="text-green-500 w-5 h-5"/> Bài làm đã lưu
                </h4>

                <div className={`p-4 rounded-xl border mb-6 flex items-center gap-4 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                   <button onClick={() => new Audio(audioUrl).play()} className={`p-3 border rounded-full transition shadow-sm ${isDarkMode ? 'bg-slate-600 border-slate-500 text-white hover:bg-slate-500' : 'bg-white border-slate-200 text-orange-600 hover:bg-slate-100'}`}>
                     <Play size={20} fill="currentColor"/>
                   </button>
                   <div className="flex-1">
                      <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                        <div className="w-full h-full bg-orange-500 opacity-50"></div>
                      </div>
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Đã ghi âm: {totalSpeakTime}s</p>
                   </div>
                </div>

                {!aiFeedback ? (
                   <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md">
                      {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles w-5 h-5/>}
                      {isAnalyzing ? "AI đang phân tích..." : "Chấm điểm bằng AI"}
                   </button>
                ) : (
                   <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-indigo-900/30 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100'}`}>
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-xs font-bold text-indigo-400 uppercase">Điểm số</span>
                         <span className={`text-3xl font-black ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{aiFeedback.score}/10</span>
                      </div>
                      
                      <div className={`text-sm mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/50'}`}>
                         <strong>Nhận xét:</strong> {aiFeedback.comment}
                      </div>

                      {aiFeedback.better_response && (
                          <div className={`text-sm mb-4 p-3 rounded-lg border-l-4 border-green-500 ${isDarkMode ? 'bg-slate-900/50' : 'bg-green-50'}`}>
                             <strong>Gợi ý trả lời:</strong> <br/>
                             <span className="italic">{aiFeedback.better_response}</span>
                          </div>
                      )}

                      <div className={`mt-4 pt-4 border-t flex gap-2 ${isDarkMode ? 'border-indigo-500/30' : 'border-indigo-100'}`}>
                         <button onClick={() => window.location.reload()} className={`flex-1 py-2 border rounded-lg text-sm font-bold transition ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>Làm lại</button>
                         <button onClick={() => navigate('/practice/speaking')} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Thoát</button>
                      </div>
                   </div>
                )}
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default SpeakingPractice;