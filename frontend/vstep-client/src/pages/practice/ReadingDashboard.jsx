import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Clock, BarChart3, FileText, 
  CheckCircle2, History, ChevronRight, AlertCircle 
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ReadingDashboard = () => {
  const navigate = useNavigate();
  
  // State quản lý bộ lọc
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [selectedTopic, setSelectedTopic] = useState('daily_life');
  
  // Data từ API
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Danh sách chủ đề (Khớp với topic_id trong Database)
  const topics = [
    { id: 'daily_life', name: 'Đời sống thường ngày', icon: '☕' },
    { id: 'education', name: 'Giáo dục & Học tập', icon: '📚' },
    { id: 'travel', name: 'Du lịch & Văn hóa', icon: '🌍' },
    { id: 'technology', name: 'Khoa học & Công nghệ', icon: '💻' },
  ];

  // 1. Fetch danh sách đề khi chọn Level/Topic
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/reading/list?level=${selectedLevel}&topic=${selectedTopic}`);
        if(res.ok) {
            const data = await res.json();
            setTests(data); 
        } else {
            setTests([]); 
        }
      } catch (error) {
        console.error("Lỗi tải đề:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [selectedLevel, selectedTopic]);

  // 2. Fetch lịch sử làm bài Reading
  useEffect(() => {
    const fetchHistory = async () => {
        const token = localStorage.getItem('vstep_token');
        if(!token) return;
        try {
            const res = await fetch(`http://localhost:5000/api/reading/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) setHistory(await res.json());
        } catch (e) { console.error(e); }
    };
    fetchHistory();
  }, []);

  // Chuyển sang trang làm bài với ID cụ thể
  const handleStartTest = (testId) => {
    navigate('/practice/reading/start', { state: { level: selectedLevel, topic: selectedTopic, testId: testId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- CỘT TRÁI: BỘ LỌC & DANH SÁCH ĐỀ (2/3) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Header Section (Màu Emerald cho Reading) */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <BookOpen className="w-8 h-8"/> Luyện Đọc VSTEP
                    </h1>
                    <p className="text-emerald-100 opacity-90 max-w-lg">
                        Nâng cao kỹ năng đọc hiểu qua các bài văn đa dạng chủ đề. Hệ thống tự động lưu kết quả.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <BookOpen size={150} />
                </div>
            </div>

            {/* 2. Bộ lọc Trình độ & Chủ đề */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">1. Chọn trình độ mục tiêu</h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {['B1', 'B2', 'C1'].map(level => (
                        <button 
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={`py-3 rounded-xl font-bold transition-all border-2 ${
                                selectedLevel === level 
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' 
                                : 'border-gray-100 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                <h3 className="font-bold text-gray-800 mb-4">2. Chọn chủ đề luyện tập</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {topics.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTopic(t.id)}
                            className={`p-4 rounded-xl text-left transition-all border ${
                                selectedTopic === t.id
                                ? 'border-emerald-500 ring-1 ring-emerald-500 bg-white shadow-md'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-xl mr-3">{t.icon}</span>
                            <span className={`font-medium ${selectedTopic === t.id ? 'text-emerald-700' : 'text-gray-700'}`}>
                                {t.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Danh sách Đề thi */}
            <div>
                <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">3</span>
                    Danh sách bài đọc có sẵn
                </h3>
                
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Đang tải dữ liệu...</div>
                ) : tests.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {tests.map((test, index) => (
                            <div key={test.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-emerald-600 transition-colors">
                                            {test.title || `Bài đọc số ${index + 1}`}
                                        </h4>
                                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><Clock size={14}/> 60 phút</span>
                                            <span className="flex items-center gap-1"><FileText size={14}/> Reading Passage</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleStartTest(test.id)}
                                    className="px-6 py-2.5 bg-white border-2 border-emerald-600 text-emerald-600 font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                                >
                                    Làm bài <ChevronRight size={18}/>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl text-center border border-dashed border-gray-300">
                        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2"/>
                        <p className="text-gray-500">Chưa có bài đọc nào cho chủ đề này.</p>
                    </div>
                )}
            </div>
          </div>

          {/* --- CỘT PHẢI: LỊCH SỬ & THỐNG KÊ (1/3) --- */}
          <div className="space-y-6">
            
            {/* Thẻ thống kê nhanh */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-orange-500"/> Thống kê Reading
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-black text-orange-600">{history.length}</div>
                        <div className="text-xs text-orange-800 font-medium">Bài đã làm</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-black text-emerald-600">
                            {history.length > 0 ? (history.reduce((a,b) => a + Number(b.diem_so), 0) / history.length).toFixed(1) : 0}
                        </div>
                        <div className="text-xs text-emerald-800 font-medium">Điểm trung bình</div>
                    </div>
                </div>
            </div>

            {/* Bảng Lịch sử */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <History size={18} className="text-gray-500"/> Lịch sử làm bài
                    </h4>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {history.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {history.map((h, i) => (
                                <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm text-gray-800 truncate max-w-[180px]" title={h.tieu_de_bai_thi}>
                                            {h.tieu_de_bai_thi || "Bài đọc luyện tập"}
                                        </span>
                                        <span className={`font-bold ${h.diem_so >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                                            {h.diem_so}/10
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>{h.ngay_lam}</span>
                                        <span>⏱ {Math.round(h.thoi_gian_lam / 60)} phút</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">Chưa có dữ liệu lịch sử.</div>
                    )}
                </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReadingDashboard;