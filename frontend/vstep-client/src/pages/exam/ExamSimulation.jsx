import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, CheckCircle, ArrowRight, Mic, PenTool, 
  Headphones, Play, AlertTriangle, Loader2, StopCircle, LogOut, User 
} from 'lucide-react';
import toast from 'react-hot-toast';

const ExamSimulation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- SKILL NAVIGATION ---
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const skills = ['listening', 'reading', 'writing', 'speaking'];
  const currentSkill = skills[currentSkillIndex];

  // --- TIMER CONFIGURATION ---
  const SKILL_DURATIONS = {
      listening: 40 * 60, 
      reading: 60 * 60,   
      writing: 60 * 60,   
      speaking: 12 * 60   
  };
  const [timeLeft, setTimeLeft] = useState(SKILL_DURATIONS['listening']); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // --- LISTENING STATE ---
  const [listeningStatus, setListeningStatus] = useState('intro'); 
  const [prepTime, setPrepTime] = useState(30); 
  const audioRef = useRef(null); 

  // --- LISTENING DIALOGUE REFS & STATE ---
  const synthRef = useRef(window.speechSynthesis);
  const isPlayingRef = useRef(false);
  const isCancelledRef = useRef(false);
  const utteranceRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [availableVoices, setAvailableVoices] = useState([]);
  const [voiceGender] = useState('female'); // Cố định giọng Nữ như bài thi thật

  // --- ANSWERS STATE ---
  const [answers, setAnswers] = useState({ listening: {}, reading: {}, writing: {}, speaking: {} });

  // --- MODAL STATE ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [pendingAction, setPendingAction] = useState(null); 

  // 1. LOAD DATA & VOICES
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/mock-tests/${id}`);
        if (!res.ok) throw new Error("Lỗi tải đề");
        const data = await res.json();
        setExamData(data);
        if (data.listening?.audio_url) {
        audioRef.current = new Audio(data.listening.audio_url);
        audioRef.current.onended = () => {
          setListeningStatus('finished');
          setIsSpeaking(false);
        };
      }
      } catch (err) {
        toast.error("Lỗi tải đề thi");
        navigate('/practice');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();

    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      isCancelledRef.current = true;
      window.speechSynthesis.cancel(); // Ngắt giọng khi unmount component
    };
  }, [id, navigate]);

  // --- LOGIC PHÂN TÍCH KỊCH BẢN ---
  const parseScript = (fullText) => {
    if (!fullText) return [];
    return fullText.split('\n').map(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return null;
        if (cleanLine.match(/^(man:|m:|male:)/i)) {
            return { role: 'male', text: cleanLine.replace(/^(man:|m:|male:)\s*/i, '') };
        } else if (cleanLine.match(/^(woman:|w:|female:)/i)) {
            return { role: 'female', text: cleanLine.replace(/^(woman:|w:|female:)\s*/i, '') };
        } else {
            return { role: 'narrator', text: cleanLine };
        }
    }).filter(item => item !== null);
  };

  // --- LOGIC PHÁT HỘI THOẠI ---
  const playDialogue = (scriptArray, index = 0) => {
    if (isCancelledRef.current || !isPlayingRef.current) return;

    if (index >= scriptArray.length) {
        setIsSpeaking(false);
        isPlayingRef.current = false;
        setListeningStatus('finished');
        toast("Bài nghe đã kết thúc!", { icon: '🔔' });
        return;
    }

    const currentLine = scriptArray[index];
    const u = new SpeechSynthesisUtterance(currentLine.text);
    
    const voices = synthRef.current.getVoices();
    const femaleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google US English'))) || voices[0];
    const maleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark'))) || voices[1] || voices[0];

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
    u.onend = () => {
        if (!isCancelledRef.current && isPlayingRef.current) { 
             setTimeout(() => playDialogue(scriptArray, index + 1), 500); 
        }
    };

    window.currentUtterance = u;
    utteranceRef.current = u;
    synthRef.current.speak(u);
  };

  
  useEffect(() => {
    
      if (currentSkill !== 'listening') {
          window.speechSynthesis.cancel();
          if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
          return;
      }

      if (listeningStatus === 'intro') {
          setIsTimerRunning(false);
          isPlayingRef.current = true;
          isCancelledRef.current = false;

          const introText = "This is the listening test. You will have 30 seconds to preview the questions before the audio starts. Please listen carefully.";
          
          const startPrep = () => {
            if (currentSkill === 'listening') { 
                setListeningStatus('prep');
                setIsTimerRunning(true);
                toast("Bắt đầu 30s đọc trước câu hỏi!", { icon: '👀' });
            }
          };

          const u = new SpeechSynthesisUtterance(introText);
          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Zira'))) || voices[0];
          
          u.voice = femaleVoice;
          u.lang = 'en-US';
          u.onend = startPrep;
          
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
      }
  }, [currentSkill, listeningStatus, voiceGender, availableVoices]);

  // 3. LISTENING PREP TIMER
  useEffect(() => {
    let prepInterval;
    if (listeningStatus === 'prep' && prepTime > 0) {
      prepInterval = setInterval(() => setPrepTime(prev => prev - 1), 1000);
    } else if (listeningStatus === 'prep' && prepTime === 0) {
      startAudioPlayback();
    }
    return () => clearInterval(prepInterval);
  }, [listeningStatus, prepTime]);

  const startAudioPlayback = () => {
    if (currentSkill !== 'listening') return; // Ngăn phát audio nếu đã bấm sang Reading

    setListeningStatus('playing');
    if (examData.listening?.audio_url && audioRef.current) {
        audioRef.current.play().catch(() => toast.error("Vui lòng bấm nút Play"));
    } else if (examData.listening?.script_content) {
        const scriptArray = parseScript(examData.listening.script_content);
        isPlayingRef.current = true;
        isCancelledRef.current = false;
        setIsSpeaking(true);
        playDialogue(scriptArray);
    } else {
        setListeningStatus('finished');
    }
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const checkCompletion = (skill) => {
      if (!examData) return { isComplete: true };
      let total = 0, answered = 0;
      if (skill === 'listening') {
          total = examData.listening?.questions?.length || 0;
          answered = Object.keys(answers.listening).length;
      } else if (skill === 'reading') {
          examData.reading?.forEach(p => total += p.questions?.length || 0);
          answered = Object.keys(answers.reading).length;
      } else if (skill === 'writing') {
          total = examData.writing?.length || 0;
          examData.writing?.forEach(t => { if(answers.writing[t.id]?.length > 10) answered++; });
      } else if (skill === 'speaking') {
          total = examData.speaking?.length || 0;
          answered = Object.keys(answers.speaking).length;
      }
      if (answered < total) return { isComplete: false, message: `Bạn còn ${total - answered} câu/phần chưa hoàn thành.` };
      return { isComplete: true };
  };

const executeSubmit = async () => {
  setIsTimerRunning(false);
  window.speechSynthesis.cancel(); 
  
  const token = localStorage.getItem('vstep_token');
  if (!token) {
    toast.error("Vui lòng đăng nhập để lưu kết quả!");
    navigate('/dang-nhap');
    return;
  }

  const toastId = toast.loading("Trợ lí AI đang tổng hợp và chấm điểm...");

  try {
    // --- 1. TÍNH ĐIỂM TRẮC NGHIỆM (Làm tròn 1 chữ số) ---
    let lCorrect = 0;
    const lQs = examData.listening?.questions || [];
    lQs.forEach(q => { 
      const userAns = (answers.listening[q.id] || "").toLowerCase();
      const correctAns = (q.correct_answer || q.correct || "").toLowerCase();
      if (userAns === correctAns && userAns !== "") lCorrect++; 
    });
    // Sử dụng .toFixed(1) để điểm không bị lẻ như 2.2222
    const listening_score = lQs.length > 0 ? parseFloat(((lCorrect / lQs.length) * 10).toFixed(1)) : 0;

    let rCorrect = 0, rTotal = 0;
    examData.reading?.forEach(p => p.questions?.forEach(q => {
      rTotal++;
      const userAns = (answers.reading[q.id] || "").toLowerCase();
      const correctAns = (q.correct_answer || q.correct || "").toLowerCase();
      if (userAns === correctAns && userAns !== "") rCorrect++;
    }));
    const reading_score = rTotal > 0 ? parseFloat(((rCorrect / rTotal) * 10).toFixed(1)) : 0;

    // --- 2. CHẤM ĐIỂM WRITING (Khớp với feedback của Backend) ---
    let writing_score = 0;
    let writing_feedback = ""; 
    if (examData.writing && examData.writing.length > 0) {
      let totalW = 0;
      for (const task of examData.writing) {
        const text = (answers.writing[task.id] || "").toString().trim();
        
        // Check nếu bỏ trống
        if (text.length < 10) {
          writing_feedback += `\n- ${task.title}: Bạn đã bỏ trống phần này, có vấn đề gì sao?`;
          continue;
        }

        const res = await fetch('http://localhost:5000/api/ai/grade-writing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: task.question_text, studentAnswer: text })
        });
        
        if (res.ok) {
          const grade = await res.json();
          totalW += parseFloat(grade.score || 0);
          // 🔥 SỬA TẠI ĐÂY: Dùng grade.feedback thay vì explanation
          writing_feedback += `\n- ${task.title}: ${grade.feedback || "AI đã ghi nhận bài làm."}`;
        }
      }
      writing_score = parseFloat((totalW / examData.writing.length).toFixed(1));
    }

    // --- 3. CHẤM ĐIỂM SPEAKING ---
    let speaking_score = 0;
    let speaking_feedback = ""; 
    if (examData.speaking && examData.speaking.length > 0) {
      let totalS = 0;
      for (const part of examData.speaking) {
        const resp = answers.speaking[part.id];
        
        // Check nếu chưa ghi âm
        if (!resp || resp === 'Chưa ghi âm' || resp === 'audio.mp3') {
          speaking_feedback += `\n- ${part.title}: Bạn đã bỏ trống phần này, có vấn đề gì sao?`;
          continue;
        }

        const res = await fetch('http://localhost:5000/api/ai/grade-speaking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: part.question_text, studentResponse: resp })
        });

        if (res.ok) {
          const grade = await res.json();
          totalS += parseFloat(grade.score || 0);
          // Backend speaking hiện tại chỉ trả về score, nên ta thêm text mặc định cho feedback
          speaking_feedback += `\n- ${part.title}: ${grade.feedback || "AI đã phân tích bài nói của bạn."}`;
        }
      }
      speaking_score = parseFloat((totalS / examData.speaking.length).toFixed(1));
    }

    // --- 4. TÍNH ĐIỂM TỔNG KẾT ---
    const overall_score = parseFloat(((listening_score + reading_score + writing_score + speaking_score) / 4).toFixed(1));

    // --- 5. GỬI DỮ LIỆU ---
    const resSubmit = await fetch('http://localhost:5000/api/mock-tests/submit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        test_id: id,
        listening_score, reading_score, writing_score, speaking_score, overall_score,
        writing_feedback: writing_feedback.trim(), 
        speaking_feedback: speaking_feedback.trim(),
        chi_tiet_bai_lam: answers 
      })
    });

    const responseData = await resSubmit.json();
    if (!resSubmit.ok) throw new Error(responseData.message || "Lỗi lưu điểm");
    
    toast.success("Hoàn thành bài thi thử!", { id: toastId });
    navigate(`/mock-test/result/${responseData.id}`); 

  } catch (err) {
    console.error("Lỗi nộp bài:", err);
    toast.error("Lỗi: " + err.message, { id: toastId });
  }
};

  const executeNextSkill = () => {
    window.speechSynthesis.cancel(); 
      if (currentSkillIndex < 3) {
          setCurrentSkillIndex(prev => prev + 1);
          window.scrollTo(0, 0);
          toast.success(`Chuyển sang: ${skills[currentSkillIndex + 1].toUpperCase()}`);
      } else {
          handleSubmitClick(); 
      }
  };

  const executeExit = () => {
    window.speechSynthesis.cancel(); 
      navigate('/practice');
  };

  const handleExitClick = () => {
      setModalMessage("Bạn đang trong quá trình làm bài thi. Nếu thoát bây giờ, toàn bộ kết quả sẽ KHÔNG được lưu.");
      setPendingAction('exit');
      setShowConfirmModal(true);
  };

  const handleNextSkillClick = () => {
      const check = checkCompletion(currentSkill);
      if (!check.isComplete) {
          setModalMessage(check.message);
          setPendingAction('next'); 
          setShowConfirmModal(true);
      } else {
          executeNextSkill();
      }
  };

  const handleSubmitClick = () => {
      const check = checkCompletion(currentSkill);
      if (!check.isComplete) {
          setModalMessage(check.message);
          setPendingAction('submit');
          setShowConfirmModal(true);
      } else {
          executeSubmit();
      }
  };

  const handleConfirmModal = () => {
      setShowConfirmModal(false);
      if (pendingAction === 'next') executeNextSkill();
      if (pendingAction === 'submit') executeSubmit();
      if (pendingAction === 'exit') executeExit();
  };

  useEffect(() => {
     setTimeLeft(SKILL_DURATIONS[skills[currentSkillIndex]]);
     if (skills[currentSkillIndex] === 'listening') {
         setIsTimerRunning(false);
     } else {
         setIsTimerRunning(true);
        window.speechSynthesis.cancel(); // Phụ trợ thêm: Tắt Trợ lí AI khi đổi Index kỹ năng
     }
  }, [currentSkillIndex]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          toast.error("Hết giờ làm bài phần này!", { icon: '⏰' });
          if (currentSkillIndex < 3) executeNextSkill(); 
          else executeSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, currentSkillIndex]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600"/></div>;
  if (!examData) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col relative">
      {/* MODAL */}
      {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                      <AlertTriangle size={32} />
                      <h3 className="text-xl font-bold">{pendingAction === 'exit' ? 'Xác nhận thoát?' : 'Chưa hoàn thành!'}</h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg">{modalMessage}</p>
                  <div className="flex gap-3 justify-end">
                      <button onClick={() => setShowConfirmModal(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50">
                          {pendingAction === 'exit' ? 'Ở lại' : 'Quay lại làm tiếp'}
                      </button>
                      <button onClick={handleConfirmModal} className="px-5 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700">
                          {pendingAction === 'exit' ? 'Thoát luôn' : 'Vẫn đi tiếp'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* HEADER */}
      <header className="h-16 bg-white border-b shadow-sm fixed top-0 w-full z-50 flex items-center justify-between px-6">
        <div className="font-bold text-lg text-indigo-700 truncate max-w-xs">{examData.title}</div>
        <div className="hidden md:flex items-center gap-2">
            {skills.map((s, idx) => (
                <div key={s} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${currentSkillIndex === idx ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-400'}`}>
                    {s}
                </div>
            ))}
        </div>
        <div className={`font-mono font-bold text-xl px-4 py-1 rounded-lg border flex items-center transition-colors ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
            <Clock size={20} className="mr-2"/>{formatTime(timeLeft)}
        </div>
      </header>

      <main className="flex-grow pt-24 pb-24 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        {currentSkill === 'listening' && examData.listening && (
            <div className="animate-fade-in relative">
                <div className="bg-white p-4 rounded-2xl shadow-md border mb-6 sticky top-20 z-40 flex items-center justify-between transition-all">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                           <Headphones size={20} className="text-indigo-600"/> {examData.listening.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 italic">
                            {listeningStatus === 'intro' && "Trợ lí AI đang đọc hướng dẫn (Đồng hồ đang dừng)..."}
                            {listeningStatus === 'prep' && "Thời gian đọc trước câu hỏi..."}
                            {listeningStatus === 'playing' && "Đang phát hội thoại..."}
                            {listeningStatus === 'finished' && "Đã kết thúc bài nghe."}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Đã loại bỏ nút chọn giới tính theo yêu cầu: Auto Nữ */}
                        {listeningStatus === 'prep' && (
                            <div className="flex items-center gap-2 text-orange-600 font-bold text-2xl animate-pulse bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                                <Clock size={24}/> {prepTime}s
                            </div>
                        )}
                        {listeningStatus === 'playing' && (
                             <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full font-bold animate-pulse">
                                ON AIR
                            </div>
                        )}
                    </div>
                </div>

                <div className={`space-y-4 transition-all duration-500 ${listeningStatus === 'intro' ? 'opacity-50 blur-[2px] pointer-events-none' : 'opacity-100'}`}>
                    {examData.listening.questions?.map((q, i) => (
                        <div key={q.id} className="bg-white p-6 rounded-xl border shadow-sm">
                            <p className="font-bold mb-4 text-gray-800"><span className="text-blue-600">Q{i+1}:</span> {q.question_text}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['a','b','c','d'].map(opt => (
                                    <label key={opt} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${answers.listening[q.id] === opt ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500' : ''}`}>
                                        <input type="radio" name={`lis_${q.id}`} checked={answers.listening[q.id] === opt} onChange={() => setAnswers(prev => ({...prev, listening: {...prev.listening, [q.id]: opt}}))} className="w-4 h-4 accent-blue-600" />
                                        <span className="text-gray-700">{q[`option_${opt}`]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* READING SECTION (Giữ nguyên) */}
        {currentSkill === 'reading' && (
             <div className="animate-fade-in space-y-12">
             {examData.reading?.map((passage, idx) => (
                 <div key={passage.id || idx} className="border-b-4 border-gray-100 pb-10">
                     <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
                         <h3 className="font-bold text-lg text-green-700 mb-2">Passage {idx+1}: {passage.title}</h3>
                         <div className="bg-green-50/30 p-4 rounded-lg text-gray-800 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-line text-justify font-serif">{passage.content}</div>
                     </div>
                     <div className="space-y-6 pl-0 md:pl-4 md:border-l-2 border-green-100">
                         {passage.questions?.map((q, i) => (
                             <div key={q.id} className="bg-white p-5 rounded-xl border shadow-sm">
                                 <p className="font-bold mb-3"><span className="text-green-600">Q{i+1}:</span> {q.question_text}</p>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                     {['a','b','c','d'].map(opt => (
                                         <label key={opt} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${answers.reading[q.id] === opt ? 'bg-green-50 border-green-500 shadow-sm' : ''}`}>
                                             <input type="radio" name={`read_${q.id}`} checked={answers.reading[q.id] === opt} onChange={() => setAnswers(prev => ({...prev, reading: {...prev.reading, [q.id]: opt}}))} className="w-4 h-4 accent-green-600" />
                                             <span className="text-gray-700">{q[`option_${opt}`]}</span>
                                         </label>
                                     ))}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             ))}
         </div>
        )}

        {/* WRITING SECTION (Giữ nguyên) */}
        {currentSkill === 'writing' && (
             <div className="animate-fade-in space-y-8">
             {examData.writing && examData.writing.length > 0 ? (
                 examData.writing.map((task, index) => (
                     <div key={task.id || index} className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                         <div className='flex items-center gap-2 mb-4 pb-2 border-b'>
                             <PenTool size={20} className="text-indigo-600"/>
                             <h3 className="text-lg font-bold text-indigo-700">{task.title || `Writing Task ${index + 1}`}</h3>
                         </div>
                         <div className="bg-gray-50 p-5 rounded-lg border mb-5 text-gray-800 font-medium whitespace-pre-line">{task.question_text || task.description}</div>
                         <textarea className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[300px] font-mono text-sm leading-relaxed" placeholder="Nhập bài làm..." value={answers.writing[task.id] || ''} onChange={(e) => setAnswers(prev => ({...prev, writing: {...prev.writing, [task.id]: e.target.value}}))} />
                         <div className="mt-2 flex justify-between text-sm text-gray-500">
                            <span>Lưu tự động</span>
                            <span>{ (answers.writing[task.id] || '').split(/\s+/).filter(w => w.length > 0).length } words</span>
                         </div>
                     </div>
                 ))
             ) : <div className="text-center p-10 bg-white">Chưa có đề viết.</div>}
         </div>
        )}
        
        {/* SPEAKING SECTION (Giữ nguyên) */}
        {currentSkill === 'speaking' && (
             <div className="animate-fade-in space-y-8">
             {examData.speaking && examData.speaking.length > 0 ? (
                 examData.speaking.map((part, index) => (
                     <div key={part.id || index} className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                         <div className='flex items-center gap-2 mb-4 pb-2 border-b'>
                             <Mic size={20} className="text-orange-600"/>
                             <h3 className="text-lg font-bold text-orange-700">{part.title || `Speaking Part ${index + 1}`}</h3>
                         </div>
                         <div className="bg-orange-50 p-5 rounded-lg border border-orange-200 mb-6">
                             <p className="text-gray-800 font-bold text-lg mb-2">Question:</p>
                             <p className="text-gray-700 whitespace-pre-line">{part.question_text}</p>
                         </div>
                         <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                             {answers.speaking[part.id] ? (
                                 <div className="text-center">
                                     <CheckCircle size={48} className="text-green-500 mx-auto mb-2"/>
                                     <p className="text-green-600 font-bold">Đã lưu!</p>
                                     <button onClick={() => setAnswers(prev => ({...prev, speaking: {...prev.speaking, [part.id]: null}}))} className="text-sm text-gray-400 underline mt-2 hover:text-red-500">Xóa & Ghi lại</button>
                                 </div>
                             ) : (
                                 <button onClick={() => { toast.success("Đã ghi âm giả lập"); setAnswers(prev => ({...prev, speaking: {...prev.speaking, [part.id]: 'audio.mp3'}})) }} className="px-8 py-3 rounded-full font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg flex items-center gap-2"><Mic size={20}/> Bắt đầu nói</button>
                             )}
                         </div>
                     </div>
                 ))
             ) : <div className="text-center p-10 bg-white">Chưa có đề nói.</div>}
         </div>
        )}
      </main>

      <footer className="h-20 bg-white border-t fixed bottom-0 w-full z-50 flex items-center justify-between px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button onClick={handleExitClick} className="px-6 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 flex items-center gap-2"><LogOut size={18}/> Thoát</button>
        <button onClick={handleNextSkillClick} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-transform active:scale-95">{currentSkill === 'speaking' ? 'Nộp Bài Thi' : 'Tiếp theo'} <ArrowRight size={20}/></button>
      </footer>
    </div>
  );
};

export default ExamSimulation;