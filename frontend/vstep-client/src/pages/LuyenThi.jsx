import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, Headphones, Mic, PenTool, ArrowRight, 
  FileText, Star, Filter, Layers, AlertCircle, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

// --- 1. COMPONENT: THẺ KỸ NĂNG (SKILL CARD) - Giữ nguyên ---
const SkillCard = ({ title, img, description, time, topicText, icon: Icon, color, href, delay }) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('vstep_token');
    if (!token) {
      toast.error("Bạn cần đăng nhập để luyện thi!", { icon: '🔒', duration: 3000 });
      setTimeout(() => navigate('/dang-nhap'), 1000);
    } else {
      navigate(href);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`group relative flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-48 overflow-hidden relative">
        <div className={`absolute inset-0 bg-${color}-900/10 group-hover:bg-transparent transition-all duration-500 z-10`} />
        <img src={img} alt={title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-sm z-20">
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-white">
          <Clock className="w-3.5 h-3.5" />
          <span>{time}</span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className={`text-xl font-bold text-gray-900 mb-2 group-hover:text-${color}-600 transition-colors`}>{title}</h3>
        <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">{description}</p>
        <div className="pt-6 border-t border-gray-100 mt-auto flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
            <Layers className="w-3.5 h-3.5" /> {topicText}
          </span>
          <span className={`text-sm font-bold text-${color}-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
            Luyện ngay <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

// --- 2. COMPONENT: THẺ THI THỬ (MOCK TEST CARD) - Cập nhật nhận dữ liệu thật ---
const MockTestCard = ({ id, title, description, created_at, delay, onStart }) => {
  return (
    <div 
      className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-1 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      
      <div className="relative h-full bg-white rounded-xl p-6 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-wider rounded-full">
            Full Test
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1" title={title}>
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-1" title={description}>
          {description || "Đề thi tổng hợp 4 kỹ năng chuẩn cấu trúc VSTEP."}
        </p>
        
        <div className="mt-auto flex items-center justify-between text-sm pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-400 font-medium text-xs">
            <Clock className="w-3.5 h-3.5" /> {new Date(created_at).toLocaleDateString('vi-VN')}
          </div>
          <button 
            onClick={() => onStart(id)} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            Bắt đầu thi
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. TRANG CHÍNH: LUYỆN THI ---
const LuyenThi = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  
  // State Mock Tests (Dữ liệu thật)
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Mock Tests từ API
  useEffect(() => {
    fetch('http://localhost:5000/api/mock-tests')
      .then(res => res.json())
      .then(data => {
        // Kiểm tra nếu API trả về lỗi hoặc không phải mảng
        if (Array.isArray(data)) {
            setMockTests(data);
        } else {
            console.error("Dữ liệu API không hợp lệ:", data);
            setMockTests([]);
        }
      })
      .catch(err => {
        console.error("Lỗi kết nối:", err);
        setMockTests([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStartMockTest = (id) => {
    const token = localStorage.getItem('vstep_token');
    if (!token) {
        toast.error("Vui lòng đăng nhập để thi thử!", { icon: '🔒' });
        navigate('/dang-nhap');
        return;
    }
    // Chuyển sang trang làm bài thi
    navigate(`/exam/intro/${id}`);
  };

  const skills = [
    { id: 'listening', title: 'Kỹ năng Nghe', img: '/img/listening.jpg', description: 'Luyện nghe các đoạn thông báo, hội thoại và bài giảng.', time: '40 phút', topicText: 'Đa dạng chủ đề', icon: Headphones, color: 'blue', href: '/practice/listening' },
    { id: 'reading', title: 'Kỹ năng Đọc', img: '/img/reading.jpg', description: 'Đọc hiểu 4 bài văn đa dạng chủ đề. Rèn kỹ năng Skim & Scan.', time: '60 phút', topicText: 'Đa dạng chủ đề', icon: BookOpen, color: 'green', href: '/practice/reading' },
    { id: 'writing', title: 'Kỹ năng Viết', img: '/img/writing.jpg', description: 'Thực hành viết thư (Task 1) và viết luận (Task 2).', time: '60 phút', topicText: 'Task 1 & Task 2', icon: PenTool, color: 'indigo', href: '/practice/writing' },
    { id: 'speaking', title: 'Kỹ năng Nói', img: '/img/speaking.jpg', description: 'Luyện nói 3 phần: Tương tác, Thảo luận và Phát triển chủ đề.', time: '12 phút', topicText: '3 Phần thi', icon: Mic, color: 'orange', href: '/practice/speaking' }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Thư viện Luyện thi VSTEP</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Hệ thống bài tập chuyên sâu và đề thi thử sát thực tế, giúp bạn tự tin chinh phục chứng chỉ B1, B2, C1.
            </p>
          </div>

          {/* Filter Tabs 
          <div className="flex justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              {['all', 'B1', 'B2', 'C1'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'all' ? 'Tất cả' : `Trình độ ${tab}`}
                </button>
              ))}
            </div>
          </div> */}

          {/* Section 1: Kỹ năng chuyên sâu */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="p-2 bg-blue-100 rounded-lg"><Filter className="w-5 h-5 text-blue-600" /></div>
              <h2 className="text-2xl font-bold text-gray-800">Luyện tập từng kỹ năng</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {skills.map((skill, index) => (
                <SkillCard key={skill.id} {...skill} delay={300 + index * 100} />
              ))}
            </div>
          </div>

          {/* Section 2: Đề thi thử (Mock Tests) - DỮ LIỆU THẬT */}
          <div>
            <div className="flex items-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="p-2 bg-orange-100 rounded-lg"><Star className="w-5 h-5 text-orange-600" /></div>
              <h2 className="text-2xl font-bold text-gray-800">Đề thi thử Full Test</h2>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600"/>
                        <span className="text-sm text-gray-500">Đang tải đề thi...</span>
                    </div>
                </div>
            ) : mockTests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockTests.map((test, index) => (
                        <MockTestCard 
                            key={test.id} 
                            {...test} 
                            delay={700 + index * 100} 
                            onStart={handleStartMockTest}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                    <p className="text-gray-500 font-medium">Chưa có đề thi thử nào. Vui lòng quay lại sau.</p>
                </div>
            )}
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LuyenThi;