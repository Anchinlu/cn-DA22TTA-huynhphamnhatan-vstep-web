import React, { useState, useEffect } from 'react';
import { Clock, ArrowLeft, CheckCircle, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ReadingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy thông tin level/topic từ trang Dashboard gửi sang
  // (Mặc định fallback nếu user truy cập trực tiếp link)
  const { level, topic } = location.state || { level: 'B1', topic: 'education' }; 

  // State quản lý dữ liệu & trạng thái
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 phút
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // 1. GỌI API LẤY ĐỀ THI KHI VÀO TRANG
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        // Gọi API Backend của bạn
        const response = await fetch(`http://localhost:5000/api/reading/test?level=${level}&topic=${topic}`);
        
        if (!response.ok) {
          throw new Error('Không tìm thấy bài tập phù hợp với lựa chọn này.');
        }
        
        const data = await response.json();
        setTestData(data); // Lưu dữ liệu thật vào state
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [level, topic]);

  // 2. Timer logic (Chỉ chạy khi có dữ liệu và chưa nộp bài)
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

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleAnswer = (qId, option) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = () => {
    const confirm = window.confirm("Bạn có chắc chắn muốn nộp bài?");
    if (confirm) {
      setIsSubmitted(true);
      setShowResult(true);
    }
  };

  // --- XỬ LÝ GIAO DIỆN LOADING / ERROR ---
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Đang tải đề thi...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4 bg-white p-8 rounded-xl shadow-lg">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => navigate('/practice/reading')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-md">
          Quay lại chọn chủ đề khác
        </button>
      </div>
    </div>
  );

  // --- GIAO DIỆN CHÍNH (KHI ĐÃ CÓ DỮ LIỆU) ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/practice/reading')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="hidden md:inline">Luyện Đọc:</span> 
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded ml-1 border border-blue-100">
                {level} - {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold transition-colors ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          
          {!isSubmitted && (
            <button 
              onClick={handleSubmit}
              className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95 text-sm"
            >
              Nộp bài
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* CỘT TRÁI: BÀI ĐỌC (PASSAGE) */}
        <div className="w-1/2 h-full overflow-y-auto bg-white p-6 md:p-10 border-r border-gray-200 shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 leading-tight">
              {testData.title}
            </h2>
            <div 
              className="prose prose-lg text-gray-700 leading-relaxed text-justify selection:bg-yellow-100 selection:text-gray-900"
              dangerouslySetInnerHTML={{ __html: testData.content }}
            />
          </div>
        </div>

        {/* CỘT PHẢI: CÂU HỎI (QUESTIONS) */}
        <div className="w-1/2 h-full overflow-y-auto bg-gray-50 p-6 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {testData.questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-200 transition-colors">
                <div className="flex gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <h3 className="text-gray-800 font-medium text-lg pt-0.5">{q.question}</h3>
                </div>

                <div className="space-y-3 ml-11">
                  {q.options.map((opt) => {
                    // Tách "A. Nội dung" thành label "A" để so sánh
                    const optLabel = opt.charAt(0); 
                    const isSelected = answers[q.id] === optLabel;
                    
                    let optionClass = "border-gray-200 hover:bg-gray-50 hover:border-gray-300";
                    if (isSelected) optionClass = "bg-blue-50 border-blue-500 ring-1 ring-blue-500";
                    
                    if (showResult) {
                      if (optLabel === q.correct) optionClass = "bg-green-50 border-green-500 ring-1 ring-green-500";
                      else if (isSelected && optLabel !== q.correct) optionClass = "bg-red-50 border-red-500 ring-1 ring-red-500 opacity-60";
                    }

                    return (
                      <label 
                        key={opt}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${optionClass}`}
                      >
                        <div className={`w-5 h-5 rounded-full border mr-3 flex-shrink-0 flex items-center justify-center ${isSelected || (showResult && optLabel === q.correct) ? 'border-transparent' : 'border-gray-300'}`}>
                           {showResult && optLabel === q.correct && <CheckCircle className="w-5 h-5 text-green-600" />}
                           {!showResult && isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                        
                        <input 
                          type="radio" 
                          name={`q-${q.id}`} 
                          value={optLabel}
                          className="hidden"
                          onChange={() => handleAnswer(q.id, optLabel)}
                          disabled={isSubmitted}
                        />
                        <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
                
                {/* Hiển thị Giải thích khi đã nộp bài */}
                {showResult && (
                  <div className="mt-4 ml-11 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-900 animate-fade-in">
                    <span className="font-bold flex items-center gap-1 mb-1 text-yellow-700">
                      <BookOpen className="w-4 h-4"/> Giải thích:
                    </span> 
                    {q.explanation || "Chưa có giải thích chi tiết."}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER NAVIGATOR */}
      <div className="h-16 bg-white border-t border-gray-200 px-6 flex items-center gap-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider hidden md:inline">Danh sách câu hỏi:</span>
        <div className="flex gap-2 overflow-x-auto pb-1 w-full scrollbar-hide">
          {testData.questions.map((q, idx) => (
            <button
              key={q.id}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-bold transition-all flex items-center justify-center border
                ${answers[q.id] 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}
                ${showResult && answers[q.id] !== q.correct ? '!bg-red-500 !border-red-500 !text-white' : ''}
                ${showResult && answers[q.id] === q.correct ? '!bg-green-500 !border-green-500 !text-white' : ''}
              `}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ReadingPractice;