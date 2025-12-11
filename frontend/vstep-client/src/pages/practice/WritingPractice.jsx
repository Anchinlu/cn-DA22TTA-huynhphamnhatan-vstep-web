import React, { useState, useEffect } from 'react';
import { 
  Clock, ArrowLeft, AlignLeft, AlertCircle, 
  Star, Sparkles, Loader2, Info,
  PenTool, Play, Home, CheckCircle2, XCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const WritingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Nhận thêm testId từ Dashboard (nếu có)
  const { task, topic, level, testId } = location.state || { task: 'task1', topic: 'daily_life', level: 'B1', testId: null };

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State quản lý luồng
  const [isStarted, setIsStarted] = useState(false);
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(task === 'task1' ? 20 * 60 : 40 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  // 1. FETCH ĐỀ THI
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Xây dựng URL API: Ưu tiên lấy theo ID
        let url = `http://localhost:5000/api/writing/test?level=${level}&topic=${topic}&task=${task}`;
        if (testId) {
            url = `http://localhost:5000/api/writing/test?id=${testId}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Không tìm thấy đề thi phù hợp.');
        const data = await res.json();
        setTestData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [level, topic, task, testId]);

  // 2. TIMER
  useEffect(() => {
    if (!isStarted || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit(true); // Hết giờ -> Force submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Chặn F5/Back
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
        clearInterval(timer);
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStarted, isSubmitted]); // Lưu ý: handleSubmit cần được xử lý cẩn thận trong dependency

  const handleEssayChange = (e) => {
    const text = e.target.value;
    setEssay(text);
    const words = text.trim().split(/\s+/);
    setWordCount(text.trim() === '' ? 0 : words.length);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleStart = () => setIsStarted(true);

  const handleExit = () => {
    if (isSubmitted) { navigate('/practice/writing'); return; }
    if (window.confirm("Thoát sẽ mất bài làm. Bạn chắc chứ?")) navigate('/practice/writing');
  };

  // NỘP BÀI & CHẤM ĐIỂM
  const handleSubmit = async (force = false) => {
    if (!force && (!essay.trim() || wordCount < 10)) {
      alert("Bài viết quá ngắn. Hãy viết thêm trước khi nộp.");
      return;
    }

    if(force || window.confirm("Nộp bài để AI chấm điểm ngay?")) {
      setIsSubmitted(true);
      setIsGrading(true);

      try {
        // 1. Gọi AI Chấm điểm
        const response = await fetch('http://localhost:5000/api/writing/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: testData?.question_text, essay: essay, level: level })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Lỗi chấm điểm");
        
        setGradingResult(data); // Hiển thị kết quả

        // 2. Lưu kết quả vào DB
        const token = localStorage.getItem('vstep_token');
        if (token) {
          const displayTitle = `Writing - ${testData?.title || 'Bài làm'}`;
          await fetch('http://localhost:5000/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              skill: 'writing', 
              level: level, 
              score: data.score, 
              duration: (task === 'task1' ? 20 * 60 : 40 * 60) - timeLeft,
              testTitle: displayTitle,
              bai_lam_text: essay, // Lưu nội dung bài viết
              ai_feedback: data    // Lưu kết quả chấm JSON
            })
          });
        }
      } catch (error) {
        alert("Lỗi: " + error.message);
        // Nếu lỗi mạng thì cho phép sửa lại để nộp lại
        if(!force) setIsSubmitted(false);
      } finally {
        setIsGrading(false);
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-indigo-600"/></div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  // --- MÀN HÌNH CHỜ ---
  if (!isStarted) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-xl text-center border border-gray-100">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <PenTool className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-gray-900 mb-2">{testData.title}</h1>
          <div className="flex justify-center gap-2 mb-6">
             <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold uppercase">{task === 'task1' ? 'Thư' : 'Luận'}</span>
             <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold uppercase">{level}</span>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-2xl text-left mb-8 space-y-3 text-indigo-900 text-sm">
            <div className="flex items-center gap-3"><Clock className="w-5 h-5" /> Thời gian: {task === 'task1' ? '20' : '40'} phút</div>
            <div className="flex items-center gap-3"><AlignLeft className="w-5 h-5" /> Yêu cầu: {task === 'task1' ? '120' : '250'}+ từ</div>
            <div className="flex items-center gap-3"><Sparkles className="w-5 h-5" /> AI Chấm điểm & Sửa lỗi</div>
          </div>

          <div className="flex gap-4">
             <button onClick={() => navigate('/practice/writing')} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Quay lại</button>
             <button onClick={handleStart} className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all">
                <Play className="w-5 h-5 fill-current"/> Bắt đầu viết
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH CHÍNH (Split View) ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <button onClick={handleExit} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition" title="Thoát">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-800 hidden md:block text-sm uppercase tracking-wide">
             {testData.title}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {!isSubmitted && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
              <Clock className="w-5 h-5" />{formatTime(timeLeft)}
            </div>
          )}
          {!isSubmitted ? (
            <button onClick={() => handleSubmit(false)} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md flex items-center gap-2"><Sparkles className="w-4 h-4"/> Nộp bài</button>
          ) : (
             <button onClick={() => navigate('/practice/writing')} className="px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2"><Home className="w-4 h-4"/> Trang chủ</button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Cột Trái: Đề bài (Luôn hiển thị) */}
        <div className="w-[40%] h-full overflow-y-auto bg-white p-8 border-r border-gray-200 hidden md:block">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-amber-800 flex items-center gap-2 text-sm uppercase mb-1"><AlertCircle size={16}/> Đề bài</h3>
            <div className="text-gray-800 font-medium whitespace-pre-line leading-relaxed">
               {testData.question_text}
            </div>
          </div>
          
          <div className="mt-8">
             <h4 className="font-bold text-gray-500 text-sm uppercase mb-4">Gợi ý làm bài</h4>
             <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                <li>Đọc kỹ đề bài để xác định đúng yêu cầu (Viết thư cho ai? Viết luận về vấn đề gì?).</li>
                <li>Lập dàn ý ngắn gọn trước khi viết.</li>
                <li>Sử dụng các từ nối (linking words) để bài viết mạch lạc.</li>
                <li>Kiểm tra lại lỗi chính tả và ngữ pháp sau khi viết xong.</li>
             </ul>
          </div>
        </div>

        {/* Cột Phải: Editor hoặc Kết quả */}
        <div className="w-full md:w-[60%] h-full flex flex-col bg-gray-50 relative">
          
          {/* Loading Overlay */}
          {isGrading && (
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-indigo-600">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <h3 className="text-xl font-bold">AI đang chấm bài...</h3>
              <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
            </div>
          )}

          {/* KẾT QUẢ CHẤM ĐIỂM */}
          {gradingResult ? (
             <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
                 <div className="max-w-3xl mx-auto space-y-8 pb-20">
                    
                    {/* Điểm số */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 flex items-center justify-between">
                        <div>
                           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Điểm số của bạn</h3>
                           <div className="text-6xl font-black text-indigo-600 tracking-tighter">{gradingResult.score}<span className="text-4xl text-gray-300 font-normal">/10</span></div>
                        </div>
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                           <Star className="w-12 h-12 text-white fill-current" />
                        </div>
                    </div>

                    {/* Nhận xét chung */}
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                       <h3 className="font-bold text-blue-800 flex gap-2 mb-3 text-lg"><Info className="w-6 h-6"/> Nhận xét chung</h3>
                       <p className="text-blue-900 leading-relaxed text-base">{gradingResult.comment}</p>
                    </div>

                    {/* Lỗi sai & Sửa lỗi */}
                    {gradingResult.corrections && gradingResult.corrections.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                           <h3 className="font-bold text-gray-800 flex gap-2 mb-4 text-lg"><XCircle className="w-6 h-6 text-red-500"/> Các lỗi cần khắc phục</h3>
                           <ul className="space-y-3">
                              {gradingResult.corrections.map((corr, idx) => (
                                 <li key={idx} className="flex gap-3 text-sm p-3 bg-red-50/50 rounded-lg">
                                    <span className="font-bold text-red-500 flex-shrink-0">•</span>
                                    <span className="text-gray-700">{corr}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                    )}

                    {/* Gợi ý cải thiện */}
                    {gradingResult.suggestion && (
                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                           <h3 className="font-bold text-emerald-800 flex gap-2 mb-3 text-lg"><CheckCircle2 className="w-6 h-6"/> Gợi ý cải thiện</h3>
                           <p className="text-emerald-900 leading-relaxed">{gradingResult.suggestion}</p>
                        </div>
                    )}
                 </div>
             </div>
          ) : (
            /* EDITOR SOẠN THẢO */
            <>
              <div className="h-12 bg-white border-b border-gray-200 flex items-center px-6 justify-between text-xs text-gray-500 flex-shrink-0 shadow-sm">
                <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-indigo-600"><AlignLeft size={14}/> Writing Editor</span>
                <div className={`font-bold px-3 py-1 rounded-full ${((task === 'task1' && wordCount < 120) || (task === 'task2' && wordCount < 250)) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                   {wordCount} words
                </div>
              </div>
              <textarea 
                 className="flex-1 w-full p-8 resize-none outline-none text-lg text-gray-800 font-serif leading-loose placeholder:text-gray-300" 
                 placeholder="Start writing your essay here..." 
                 value={essay} 
                 onChange={handleEssayChange} 
                 disabled={isSubmitted} 
                 spellCheck="false"
                 autoFocus
              ></textarea>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingPractice;