import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Headphones, Clock, BarChart3, PlayCircle, 
  CheckCircle2, History, ChevronRight, AlertCircle 
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ListeningDashboard = () => {
  const navigate = useNavigate();
  
  // State quản lý bộ lọc
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [selectedTopicId, setSelectedTopicId] = useState(''); 
  
  // Data từ API
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [topics, setTopics] = useState([]); // State lưu danh sách chủ đề từ DB
  const [loading, setLoading] = useState(false);

  // Hàm hỗ trợ map icon dựa trên slug/tên (Vì DB không lưu icon)
  const getTopicIcon = (slug) => {
    if (slug?.includes('doi-song') || slug?.includes('daily')) return '☕';
    if (slug?.includes('giao-duc') || slug?.includes('edu')) return '📚';
    if (slug?.includes('du-lich') || slug?.includes('travel')) return '🌍';
    if (slug?.includes('cong-nghe') || slug?.includes('tech')) return '💻';
    return '🎧'; 
  };

  // 1. Fetch danh sách Topics từ Server (QUAN TRỌNG)
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/topics')
      .then(res => res.json())
      .then(data => {
        setTopics(data);
        // Tự động chọn topic đầu tiên nếu có dữ liệu
        if (data.length > 0 && !selectedTopicId) {
            setSelectedTopicId(data[0].id);
        }
      })
      .catch(err => console.error("Lỗi load topics:", err));
  }, []);

  // 2. Fetch danh sách đề khi chọn Level/TopicId
  useEffect(() => {
    if (!selectedTopicId) return;

    const fetchTests = async () => {
      setLoading(true);
      try {
        // Gọi API với ID số thực tế
        const res = await fetch(`http://localhost:5000/api/listening/list?level=${selectedLevel}&topic=${selectedTopicId}`);
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
  }, [selectedLevel, selectedTopicId]);

  // 3. Fetch lịch sử làm bài
  useEffect(() => {
    const fetchHistory = async () => {
        const token = localStorage.getItem('vstep_token');
        if(!token) return;
        try {
            const res = await fetch(`http://localhost:5000/api/listening/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) setHistory(await res.json());
        } catch (e) { console.error(e); }
    };
    fetchHistory();
  }, []);

  // Xử lý khi chọn đề để thi
  const handleStartTest = (testId) => {
    // Truyền đúng topicId (số) sang trang làm bài
    navigate('/practice/listening/start', { 
        state: { level: selectedLevel, topicId: selectedTopicId, testId: testId } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Headphones className="w-8 h-8"/> Luyện Nghe VSTEP
                    </h1>
                    <p className="text-blue-100 opacity-90 max-w-lg">
                        Chọn trình độ và chủ đề phù hợp để bắt đầu luyện tập. Hệ thống sẽ lưu lại tiến độ của bạn.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <Headphones size={150} />
                </div>
            </div>

            {/* Bộ lọc Trình độ & Chủ đề */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">1. Chọn trình độ</h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {['B1', 'B2', 'C1'].map(level => (
                        <button 
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={`py-3 rounded-xl font-bold transition-all border-2 ${
                                selectedLevel === level 
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                                : 'border-gray-100 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                <h3 className="font-bold text-gray-800 mb-4">2. Chọn chủ đề</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Render Topics từ API */}
                    {topics.length > 0 ? topics.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTopicId(t.id)}
                            className={`p-4 rounded-xl text-left transition-all border ${
                                selectedTopicId === t.id
                                ? 'border-blue-500 ring-1 ring-blue-500 bg-white shadow-md'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-xl mr-3">{getTopicIcon(t.slug)}</span>
                            <span className={`font-medium ${selectedTopicId === t.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                {t.name}
                            </span>
                        </button>
                    )) : (
                        <p className="text-gray-400 text-sm col-span-2 text-center">Đang tải chủ đề...</p>
                    )}
                </div>
            </div>

            {/* Danh sách Đề thi */}
            <div>
                <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                    Danh sách đề thi
                </h3>
                
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Đang tải đề thi...</div>
                ) : tests.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {tests.map((test, index) => (
                            <div key={test.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                                            {test.title || `Đề luyện tập số ${index + 1}`}
                                        </h4>
                                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><Clock size={14}/> 40 phút</span>
                                            <span className="flex items-center gap-1"><CheckCircle2 size={14}/> 35 câu hỏi</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleStartTest(test.id)}
                                    className="px-6 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                                >
                                    Làm bài <PlayCircle size={18}/>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl text-center border border-dashed border-gray-300">
                        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2"/>
                        <p className="text-gray-500">Chưa có đề thi nào cho chủ đề này.</p>
                    </div>
                )}
            </div>
          </div>

          {/* --- CỘT PHẢI: LỊCH SỬ & THỐNG KÊ (1/3) --- */}
          <div className="space-y-6">
            
            {/* Thẻ thống kê nhanh */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-orange-500"/> Tổng quan
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-black text-orange-600">{history.length}</div>
                        <div className="text-xs text-orange-800 font-medium">Đề đã làm</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-black text-green-600">
                            {history.length > 0 ? (history.reduce((a,b) => a + Number(b.diem_so), 0) / history.length).toFixed(1) : 0}
                        </div>
                        <div className="text-xs text-green-800 font-medium">Điểm trung bình</div>
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
                                        <span className="font-bold text-sm text-gray-800 truncate max-w-[150px]" title={h.tieu_de_bai_thi}>
                                            {h.tieu_de_bai_thi || "Đề luyện tập"}
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

export default ListeningDashboard;