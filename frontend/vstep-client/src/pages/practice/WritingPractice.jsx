import React, { useState, useEffect } from 'react';
// 👇 Đã thêm 'Info' vào dòng import dưới đây
import { Clock, ArrowLeft, Save, AlignLeft, AlertCircle, CheckCircle2, XCircle, Star, Sparkles, Loader2, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const WritingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { task, topic, level } = location.state || { task: '1', topic: 'education', level: 'B1' };

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(task === '1' ? 20 * 60 : 40 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State cho AI Grading
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  // 1. Fetch Đề bài
  useEffect(() => {
    fetch(`http://localhost:5000/api/writing/test?level=${level}&topic=${topic}&task=${task}`)
      .then(res => res.json())
      .then(data => {
        setTestData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [level, topic, task]);

  // 2. Timer
  useEffect(() => {
    if (isSubmitted || loading) return;
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
    return () => clearInterval(timer);
  }, [isSubmitted, loading]);

  // 3. Hàm đếm từ
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

  // 4. Xử lý Nộp bài & Chấm điểm AI (và lưu kết quả vào DB)
  const handleSubmit = async () => {
    if (!essay.trim() || wordCount < 10) {
      alert("Bài viết quá ngắn.");
      return;
    }

    if(window.confirm("Nộp bài để AI chấm điểm ngay?")) {
      setIsSubmitted(true);
      setIsGrading(true);

      try {
        // 1. Gọi AI chấm điểm
        const response = await fetch('http://localhost:5000/api/writing/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: testData?.title, essay: essay, level: level })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi chấm điểm');
        
        setGradingResult(data); // Hiển thị kết quả

        // === 2. LƯU KẾT QUẢ VÀO DB (MỚI) ===
        const token = localStorage.getItem('vstep_token');
        if (token) {
          try {
            await fetch('http://localhost:5000/api/results', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                skill: 'writing',
                level: level,
                score: data.score,
                duration: (task === '1' ? 20 * 60 : 40 * 60) - timeLeft
              })
            });
            console.log('Đã lưu điểm Writing vào DB');
          } catch (err) {
            console.warn('Không lưu được kết quả vào DB:', err.message);
          }
        }
        // ====================================

      } catch (error) {
        alert("Lỗi: " + error.message);
        setIsSubmitted(false);
      } finally {
        setIsGrading(false);
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải đề...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/practice/writing')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-800 flex items-center gap-2">
              Writing Task {task}: {level}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {!isSubmitted && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
          
          {!isSubmitted && (
            <button 
              onClick={handleSubmit}
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Nộp bài & Chấm điểm
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* TRÁI: ĐỀ BÀI (40%) */}
        <div className="w-[40%] h-full overflow-y-auto bg-white p-8 border-r border-gray-200 hidden md:block">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-yellow-800 flex items-center gap-2 text-sm uppercase">
              <AlertCircle size={16}/> Yêu cầu
            </h3>
            <p className="text-sm text-yellow-900 mt-1">
              {task === '1' ? 'Viết thư: Khoảng 20 phút, tối thiểu 120 từ.' : 'Viết luận: Khoảng 40 phút, tối thiểu 250 từ.'}
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">{testData?.title}</h2>
          <div 
            className="prose prose-indigo text-gray-700"
            dangerouslySetInnerHTML={{ __html: testData?.content }}
          />
        </div>

        {/* PHẢI: TRÌNH SOẠN THẢO HOẶC KẾT QUẢ (60%) */}
        <div className="w-full md:w-[60%] h-full flex flex-col bg-gray-50 relative">
          
          {/* MÀN HÌNH LOADING KHI AI ĐANG CHẤM */}
          {isGrading && (
            <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center text-indigo-600">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <h3 className="text-xl font-bold">AI đang chấm bài...</h3>
              <p className="text-gray-500">Vui lòng đợi trong giây lát để nhận kết quả chi tiết.</p>
            </div>
          )}

          {/* MÀN HÌNH KẾT QUẢ (HIỂN THỊ SAU KHI CHẤM XONG) */}
          {gradingResult ? (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* 1. Thẻ Điểm Số */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider">Điểm số VSTEP</h3>
                    <div className="text-5xl font-extrabold text-indigo-600 mt-2">{gradingResult.score}/10</div>
                  </div>
                  <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Star className="w-10 h-10 text-indigo-500 fill-current" />
                  </div>
                </div>

                {/* 2. Nhận xét chung */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5" /> Nhận xét tổng quan
                  </h3>
                  <p className="text-blue-900 leading-relaxed">{gradingResult.comment}</p>
                </div>

                {/* 3. Sửa lỗi chi tiết */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" /> Các lỗi cần khắc phục
                  </h3>
                  
                  {gradingResult.corrections && gradingResult.corrections.length > 0 ? (
                    <div className="space-y-4">
                      {gradingResult.corrections.map((err, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-start gap-3 mb-2">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-red-600 line-through mr-2 decoration-2">{err.original}</span>
                              <ArrowLeft className="inline w-4 h-4 text-gray-400 mx-1" />
                              <span className="text-green-600 font-bold">{err.correction}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 ml-8 italic">💡 {err.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Bài viết rất tốt, không tìm thấy lỗi ngữ pháp nghiêm trọng!
                    </p>
                  )}
                </div>

                {/* 4. Gợi ý nâng cao */}
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                  <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" /> Gợi ý nâng cấp bài viết
                  </h3>
                  <p className="text-green-900 italic border-l-4 border-green-300 pl-4 py-1 bg-green-100/50 rounded-r-lg">
                    "{gradingResult.suggestion}"
                  </p>
                </div>

                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition"
                >
                  Làm bài mới
                </button>

              </div>
            </div>
          ) : (
            /* KHU VỰC SOẠN THẢO (HIỆN KHI CHƯA NỘP) */
            <>
              {/* Toolbar */}
              <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 justify-between text-xs text-gray-500 flex-shrink-0">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><AlignLeft size={14}/> Editor</span>
                </div>
                <div className={`font-bold ${
                  (task === '1' && wordCount < 120) || (task === '2' && wordCount < 250) 
                  ? 'text-red-500' : 'text-green-600'
                }`}>
                  {wordCount} từ
                </div>
              </div>

              {/* Textarea */}
              <textarea
                className="flex-1 w-full p-8 resize-none outline-none text-lg text-gray-800 font-sans leading-relaxed"
                placeholder="Start writing your essay here..."
                value={essay}
                onChange={handleEssayChange}
                disabled={isSubmitted}
                spellCheck="false"
              ></textarea>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default WritingPractice;