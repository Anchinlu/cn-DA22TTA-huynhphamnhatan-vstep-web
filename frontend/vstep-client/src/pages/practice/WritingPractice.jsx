import React, { useState, useEffect } from 'react';
import { 
  Clock, ArrowLeft, Save, AlignLeft, AlertCircle, 
  CheckCircle2, XCircle, Star, Sparkles, Loader2, Info,
  PenTool, Play, AlertTriangle, Home
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const WritingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { task, topic, level } = location.state || { task: '1', topic: 'education', level: 'B1' };

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State quản lý luồng
  const [isStarted, setIsStarted] = useState(false);
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(task === '1' ? 20 * 60 : 40 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  // 1. FETCH
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/writing/test?level=${level}&topic=${topic}&task=${task}`);
        if (!res.ok) throw new Error('Không tìm thấy đề thi.');
        const data = await res.json();
        setTestData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [level, topic, task]);

  // 2. TIMER
  useEffect(() => {
    if (!isStarted || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  const handleSubmit = async () => {
    if (!essay.trim() || wordCount < 10) {
      alert("Bài viết quá ngắn.");
      return;
    }

    if(window.confirm("Nộp bài để AI chấm điểm ngay?")) {
      setIsSubmitted(true);
      setIsGrading(true);

      try {
        const response = await fetch('http://localhost:5000/api/writing/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: testData?.title, essay: essay, level: level })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        setGradingResult(data);

        const token = localStorage.getItem('vstep_token');
        if (token) {
          await fetch('http://localhost:5000/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              skill: 'writing', level, score: data.score, duration: (task === '1' ? 20 * 60 : 40 * 60) - timeLeft
            })
          });
        }
      } catch (error) {
        alert("Lỗi: " + error.message);
        setIsSubmitted(false);
      } finally {
        setIsGrading(false);
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-indigo-600"/></div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  // START SCREEN
  if (!isStarted) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-xl text-center border border-gray-100">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <PenTool className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">{testData.title}</h1>
          <div className="flex justify-center gap-2 mb-6">
             <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold uppercase">Task {task}</span>
             <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold uppercase">{level}</span>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-2xl text-left mb-8 space-y-3 text-indigo-900 text-sm">
            <div className="flex items-center gap-3"><Clock className="w-5 h-5" /> Thời gian: {task === '1' ? '20' : '40'} phút</div>
            <div className="flex items-center gap-3"><AlignLeft className="w-5 h-5" /> Yêu cầu: {task === '1' ? '120' : '250'}+ từ</div>
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

  // MAIN UI (Giữ nguyên phần cũ, chỉ thay đổi Header một chút để có nút Thoát)
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <button onClick={handleExit} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition" title="Thoát">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-800 hidden md:block">Writing Task {task}</h1>
        </div>

        <div className="flex items-center gap-6">
          {!isSubmitted && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
              <Clock className="w-5 h-5" />{formatTime(timeLeft)}
            </div>
          )}
          {!isSubmitted ? (
            <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md flex items-center gap-2"><Sparkles className="w-4 h-4"/> Nộp bài</button>
          ) : (
             <button onClick={() => navigate('/practice/writing')} className="px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2"><Home className="w-4 h-4"/> Trang chủ</button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Cột Trái: Đề bài */}
        <div className="w-[40%] h-full overflow-y-auto bg-white p-8 border-r border-gray-200 hidden md:block">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-yellow-800 flex items-center gap-2 text-sm uppercase"><AlertCircle size={16}/> Yêu cầu</h3>
            <p className="text-sm text-yellow-900 mt-1">{task === '1' ? 'Viết thư: ~120 từ' : 'Viết luận: ~250 từ'}</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{testData.title}</h2>
          <div className="prose prose-indigo text-gray-700" dangerouslySetInnerHTML={{ __html: testData.content }} />
        </div>

        {/* Cột Phải: Editor / Kết quả */}
        <div className="w-full md:w-[60%] h-full flex flex-col bg-gray-50 relative">
          {isGrading && (
            <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center text-indigo-600">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <h3 className="text-xl font-bold">AI đang chấm bài...</h3>
            </div>
          )}

          {gradingResult ? (
             <div className="flex-1 overflow-y-auto p-8">
                 {/* (Phần hiển thị kết quả chấm điểm - Giữ nguyên như code cũ của bạn) */}
                 <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 flex items-center justify-between">
                        <div><h3 className="text-lg font-bold text-gray-500 uppercase">Điểm số</h3><div className="text-5xl font-extrabold text-indigo-600 mt-2">{gradingResult.score}/10</div></div>
                        <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center"><Star className="w-10 h-10 text-indigo-500 fill-current" /></div>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100"><h3 className="font-bold text-blue-800 flex gap-2 mb-2"><Info className="w-5 h-5"/> Nhận xét</h3><p className="text-blue-900">{gradingResult.comment}</p></div>
                    {/* ... (Các phần sửa lỗi, gợi ý giữ nguyên) ... */}
                 </div>
             </div>
          ) : (
            <>
              <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 justify-between text-xs text-gray-500 flex-shrink-0">
                <span className="flex items-center gap-1"><AlignLeft size={14}/> Editor</span>
                <div className={`font-bold ${(task === '1' && wordCount < 120) || (task === '2' && wordCount < 250) ? 'text-red-500' : 'text-green-600'}`}>{wordCount} từ</div>
              </div>
              <textarea className="flex-1 w-full p-8 resize-none outline-none text-lg text-gray-800 font-sans leading-relaxed" placeholder="Start writing..." value={essay} onChange={handleEssayChange} disabled={isSubmitted} spellCheck="false"></textarea>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingPractice;