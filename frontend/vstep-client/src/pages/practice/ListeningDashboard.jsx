import React, { useState } from 'react';
import { Headphones, ArrowLeft, ArrowRight, BookOpen, Coffee, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

const ListeningDashboard = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState('B1');
  const [topic, setTopic] = useState('daily_life');

  const handleStart = () => {
    navigate('/practice/listening/test', { state: { level, topic } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
           <button onClick={() => navigate('/luyen-thi')} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
            <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
          </button>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-blue-600 p-10 text-white text-center relative overflow-hidden">
                <Headphones className="w-24 h-24 absolute -bottom-4 -right-4 text-blue-500 opacity-50 rotate-12" />
                <h1 className="text-3xl font-bold relative z-10">Luyện Nghe VSTEP</h1>
                <p className="text-blue-100 mt-2 relative z-10">Cải thiện kỹ năng nghe hiểu qua các bài tập thực tế</p>
            </div>

            <div className="p-8">
              {/* Chọn Level */}
              <div className="mb-8">
                <label className="block text-gray-700 font-bold mb-3">1. Chọn trình độ</label>
                <div className="grid grid-cols-3 gap-4">
                  {['B1', 'B2', 'C1'].map((l) => (
                    <button 
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all ${
                        level === l 
                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                        : 'border-gray-100 hover:border-gray-300 text-gray-500'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn Topic */}
              <div className="mb-8">
                <label className="block text-gray-700 font-bold mb-3">2. Chọn chủ đề</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setTopic('daily_life')} className={`flex items-center p-4 rounded-xl border-2 transition-all ${topic === 'daily_life' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <Coffee className="w-6 h-6 mr-3" /> Đời sống thường ngày
                  </button>
                  <button onClick={() => setTopic('education')} className={`flex items-center p-4 rounded-xl border-2 transition-all ${topic === 'education' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <BookOpen className="w-6 h-6 mr-3" /> Giáo dục & Học tập
                  </button>
                  <button onClick={() => setTopic('travel')} className={`flex items-center p-4 rounded-xl border-2 transition-all ${topic === 'travel' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <Globe className="w-6 h-6 mr-3" /> Du lịch & Văn hóa
                  </button>
                </div>
              </div>

              <button onClick={handleStart} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                Bắt đầu nghe <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListeningDashboard;