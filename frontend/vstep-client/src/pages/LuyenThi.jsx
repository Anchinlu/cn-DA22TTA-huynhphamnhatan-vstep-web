import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  BookOpen, 
  Headphones, 
  Mic, 
  PenTool, 
  ArrowRight, 
  FileText, 
  Star,
  Filter
} from 'lucide-react';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

// --- 1. COMPONENT: THẺ KỸ NĂNG (SKILL CARD) ---
const SkillCard = ({ title, img, description, time, questions, icon: Icon, color, href }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('vstep_token');
    
    if (!token) {
      // Chưa đăng nhập -> Hỏi người dùng
      if(window.confirm("Bạn cần đăng nhập để sử dụng tính năng Luyện thi. Đi đến trang đăng nhập ngay?")) {
        navigate('/dang-nhap');
      }
    } else {
      // Đã đăng nhập -> Vào học
      navigate(href);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      {/* Phần Ảnh Header */}
      <div className="h-48 overflow-hidden relative">
        {/* Lớp phủ màu khi hover */}
        <div className={`absolute inset-0 bg-${color}-900/10 group-hover:bg-transparent transition-all duration-500 z-10`} />
        
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Icon nổi góc phải */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-sm z-20">
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        
        {/* Badge thời gian góc trái */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-white">
          <Clock className="w-3.5 h-3.5" />
          <span>{time}</span>
        </div>
      </div>

      {/* Phần Nội dung */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className={`text-xl font-bold text-gray-900 mb-2 group-hover:text-${color}-600 transition-colors`}>
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
          {description}
        </p>

        <div className="pt-6 border-t border-gray-100 mt-auto flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
            <BookOpen className="w-3.5 h-3.5" />
            {questions}
          </span>
          
          <span className={`text-sm font-bold text-${color}-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
            Luyện ngay <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

// --- 2. COMPONENT: THẺ THI THỬ (MOCK TEST CARD) ---
const MockTestCard = ({ title, description, time, level }) => (
  <div className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-1 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
    
    <div className="relative h-full bg-white rounded-xl p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 rounded-xl">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-wider rounded-full">
          {level}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-6 line-clamp-2">
        {description}
      </p>
      
      <div className="mt-auto flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-gray-500 font-medium">
          <Clock className="w-4 h-4" /> {time}
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 transition-all">
          Bắt đầu thi
        </button>
      </div>
    </div>
  </div>
);

// --- 3. TRANG CHÍNH: LUYỆN THI ---
const LuyenThi = () => {
  const [activeTab, setActiveTab] = useState('all');

  const skills = [
    {
      id: 'listening',
      title: 'Kỹ năng Nghe (Listening)',
      img: '/img/listening.jpg', 
      description: 'Luyện nghe các đoạn thông báo, hội thoại và bài giảng. Rèn luyện khả năng nắm bắt ý chính.',
      time: '40 phút',
      questions: '35 câu hỏi',
      icon: Headphones,
      color: 'blue',
      href: '/practice/listening'
    },
    {
      id: 'reading',
      title: 'Kỹ năng Đọc (Reading)',
      img: '/img/reading.jpg',
      description: 'Đọc hiểu 4 bài văn đa dạng chủ đề. Phát triển kỹ năng đọc lướt, đọc tìm ý và suy luận.',
      time: '60 phút',
      questions: '40 câu hỏi',
      icon: BookOpen,
      color: 'green',
      href: '/practice/reading'
    },
    {
      id: 'writing',
      title: 'Kỹ năng Viết (Writing)',
      img: '/img/writing.jpg',
      description: 'Thực hành viết thư (Task 1) và viết luận (Task 2). Cung cấp bộ đếm từ và đồng hồ.',
      time: '60 phút',
      questions: '2 bài viết',
      icon: PenTool,
      color: 'indigo', 
      href: '/practice/writing'
    },
    {
      id: 'speaking',
      title: 'Kỹ năng Nói (Speaking)',
      img: '/img/speaking.jpg',
      description: 'Luyện nói 3 phần: Tương tác xã hội, Thảo luận giải pháp và Phát triển chủ đề.',
      time: '12 phút',
      questions: '3 phần thi',
      icon: Mic,
      color: 'orange',
      href: '/practice/speaking'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Thư viện Luyện thi VSTEP
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Hệ thống bài tập chuyên sâu cho từng kỹ năng và đề thi thử sát với thực tế, giúp bạn tự tin chinh phục chứng chỉ B1, B2, C1.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center mb-12">
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
          </div>

          {/* Section 1: Kỹ năng chuyên sâu */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Luyện tập từng kỹ năng</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {skills.map((skill) => (
                <SkillCard key={skill.id} {...skill} />
              ))}
            </div>
          </div>

          {/* Section 2: Đề thi thử (Mock Tests) */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Đề thi thử Full Test</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <MockTestCard 
                title="VSTEP Mock Test #01" 
                description="Đề thi mô phỏng cấu trúc mới nhất 2025. Bao gồm đầy đủ 4 kỹ năng."
                time="180 phút"
                level="Tổng hợp"
              />
              <MockTestCard 
                title="VSTEP Mock Test #02" 
                description="Thử sức với đề thi có độ khó tương đương kỳ thi thật tại ĐH Sư Phạm."
                time="180 phút"
                level="Tổng hợp"
              />
              {/* Thêm thẻ div rỗng hoặc comming soon nếu muốn layout đẹp hơn */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-white">
                  <span className="text-2xl">+</span>
                </div>
                <span className="font-medium">Sắp có đề mới</span>
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LuyenThi;