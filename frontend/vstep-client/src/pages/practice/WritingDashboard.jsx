import React, { useState } from 'react';
import { 
  PenTool, Mail, FileText, 
  CheckCircle2, Info, ArrowRight,
  BookOpen, Briefcase, Globe, Cpu, Zap, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

const WritingDashboard = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState('1'); // 1: Task 1, 2: Task 2
  const [selectedTopic, setSelectedTopic] = useState('education');
  const [level, setLevel] = useState('B1');

  const tasks = [
    { 
      id: '1', 
      name: 'Task 1: Viết thư (Letter)', 
      desc: 'Viết email/thư phản hồi. Thời gian: 20 phút. Độ dài: ~120 từ.', 
      icon: Mail,
      color: 'blue'
    },
    { 
      id: '2', 
      name: 'Task 2: Viết luận (Essay)', 
      desc: 'Viết bài luận xã hội. Thời gian: 40 phút. Độ dài: ~250 từ.', 
      icon: FileText,
      color: 'orange'
    },
  ];

  const topics = [
    { id: 'education', name: 'Giáo dục', icon: BookOpen },
    { id: 'technology', name: 'Công nghệ', icon: Cpu },
    { id: 'business', name: 'Kinh tế', icon: Briefcase },
    { id: 'environment', name: 'Môi trường', icon: Globe },
    { id: 'health', name: 'Sức khỏe', icon: Zap },
  ];

  const handleStart = () => {
    navigate('/practice/writing/test', { 
      state: { task: selectedTask, topic: selectedTopic, level } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        {/* HERO */}
        <div className="bg-indigo-900 text-white pt-10 pb-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <button onClick={() => navigate('/luyen-thi')} className="flex items-center text-indigo-200 hover:text-white mb-6 transition">
              <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
            </button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <PenTool className="w-10 h-10 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Luyện Viết (Writing)</h1>
                <p className="text-indigo-200 mt-1">Rèn luyện kỹ năng viết thư và luận theo chuẩn VSTEP</p>
              </div>
            </div>
          </div>
        </div>

        {/* SELECTION CARD */}
        <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-20">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            
            {/* 1. Chọn Dạng bài */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">1</span>
                Chọn dạng bài (Task)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task.id)}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                      selectedTask === task.id 
                      ? `border-${task.color}-500 bg-${task.color}-50` 
                      : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className={`absolute top-4 right-4 ${selectedTask === task.id ? `text-${task.color}-600` : 'text-transparent'}`}>
                      <CheckCircle2 />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-${task.color}-100 text-${task.color}-600`}>
                        <task.icon size={24} />
                      </div>
                      <h3 className={`text-lg font-bold text-${task.color}-700`}>{task.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{task.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Chọn Chủ đề & Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">2</span>
                   Chọn chủ đề
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {topics.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedTopic(t.id)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-2
                        ${selectedTopic === t.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}
                      `}
                    >
                      <t.icon size={20} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">3</span>
                   Trình độ
                </h2>
                <div className="space-y-3">
                   {['B1', 'B2', 'C1'].map(l => (
                     <button 
                        key={l} 
                        onClick={() => setLevel(l)}
                        className={`w-full p-3 rounded-xl border text-left font-bold transition-all ${level === l ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                      >
                        {l}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            {/* START BUTTON */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleStart}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-transform hover:-translate-y-1 flex items-center gap-2"
              >
                Bắt đầu viết <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WritingDashboard;