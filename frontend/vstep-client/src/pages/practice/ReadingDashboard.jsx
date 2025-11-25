import React, { useState } from 'react';
import { 
  BookOpen, 
  BarChart3, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Zap, 
  Globe, 
  Briefcase, 
  Cpu,
  ArrowLeft // Thêm icon ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Header & Footer (Chú ý đường dẫn ../../ vì đang ở trong folder con 'practice')
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

// Helper Icon Components
const ClockIcon = ({className}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)
const BookIcon = ({className}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
)
const QuestionIcon = ({className}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

const ReadingDashboard = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const vstepStructure = [
    { title: "Thời gian", value: "60 phút", icon: ClockIcon },
    { title: "Số lượng", value: "4 Bài đọc", icon: BookIcon },
    { title: "Câu hỏi", value: "40 Câu", icon: QuestionIcon },
  ];

  const levels = [
    { id: 'B1', name: 'Cơ bản (B1)', desc: 'Bài đọc ngắn, từ vựng thông dụng.', color: 'green' },
    { id: 'B2', name: 'Trung cấp (B2)', desc: 'Bài đọc dài, chủ đề học thuật.', color: 'blue' },
    { id: 'C1', name: 'Nâng cao (C1)', desc: 'Văn bản chuyên sâu, tư duy cao.', color: 'orange' },
  ];

  const topics = [
    { id: 'education', name: 'Giáo dục', icon: BookOpen },
    { id: 'technology', name: 'Công nghệ', icon: Cpu },
    { id: 'business', name: 'Kinh tế', icon: Briefcase },
    { id: 'environment', name: 'Môi trường', icon: Globe },
    { id: 'health', name: 'Sức khỏe', icon: Zap },
  ];

  const handleStart = () => {
    if (!selectedTopic) {
      alert("Vui lòng chọn một chủ đề để bắt đầu!");
      return;
    }
    navigate('/practice/reading/test', { 
      state: { level: selectedLevel, topic: selectedTopic } 
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 1. HEADER CHUNG */}
      <Header />

      <main className="flex-grow pb-20">
        
        {/* HERO SECTION */}
        <div className="bg-blue-900 text-white pt-24 pb-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="max-w-5xl mx-auto relative z-10">
            {/* Nút Quay Lại */}
            <button 
              onClick={() => navigate('/luyen-thi')}
              className="flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors w-fit"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại Thư viện
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-blue-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Kỹ năng Đọc (Reading)</h1>
                <p className="text-blue-200 mt-1">Cấu hình bài luyện tập theo ý bạn</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {vstepStructure.map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <item.icon className="w-6 h-6 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs uppercase font-bold tracking-wider">{item.title}</p>
                    <p className="text-xl font-bold text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SELECTION CARD */}
        <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-20">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            
            {/* 1. Chọn Cấp độ */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
                Chọn độ khó
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {levels.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group
                      ${selectedLevel === lvl.id 
                        ? `border-${lvl.color}-500 bg-${lvl.color}-50` 
                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    {selectedLevel === lvl.id && (
                      <div className={`absolute top-4 right-4 text-${lvl.color}-600`}>
                        <CheckCircle2 className="w-6 h-6 fill-current" />
                      </div>
                    )}
                    <div className={`text-lg font-bold mb-1 text-${lvl.color}-700`}>{lvl.name}</div>
                    <p className="text-sm text-gray-500 leading-relaxed">{lvl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Chọn Chủ đề */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">2</div>
                Chọn chủ đề
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200
                      ${selectedTopic === topic.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-gray-50 hover:text-blue-600'}
                    `}
                  >
                    <topic.icon className={`w-8 h-8 mb-3 ${selectedTopic === topic.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-bold text-sm">{topic.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                <Info className="w-4 h-4 text-blue-500" />
                Hệ thống sẽ tạo bài thi dựa trên lựa chọn của bạn.
              </div>
              
              <button
                onClick={handleStart}
                disabled={!selectedTopic}
                className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all transform active:scale-95
                  ${selectedTopic 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-1' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                Bắt đầu làm bài <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* 3. FOOTER CHUNG */}
      <Footer />
    </div>
  );
};

export default ReadingDashboard;