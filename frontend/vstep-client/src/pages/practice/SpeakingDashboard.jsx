import React, { useState } from 'react';
import { Mic, MessageCircle, Users, BrainCircuit, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

const SpeakingDashboard = () => {
  const navigate = useNavigate();
  const [selectedPart, setSelectedPart] = useState('1');

  const parts = [
    { id: '1', name: 'Part 1: Tương tác xã hội', desc: 'Trả lời 3-6 câu hỏi ngắn về bản thân.', icon: MessageCircle, color: 'blue' },
    { id: '2', name: 'Part 2: Thảo luận giải pháp', desc: 'Chọn 1 trong 3 phương án và giải thích.', icon: Users, color: 'green' },
    { id: '3', name: 'Part 3: Phát triển chủ đề', desc: 'Thuyết trình về một chủ đề (Sơ đồ tư duy).', icon: BrainCircuit, color: 'purple' },
  ];

  const handleStart = () => {
    navigate('/practice/speaking/test', { state: { part: selectedPart } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <button onClick={() => navigate('/luyen-thi')} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
             <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
          </button>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-orange-100 rounded-2xl">
                <Mic className="w-10 h-10 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Luyện Nói (Speaking)</h1>
                <p className="text-gray-500">Luyện tập phản xạ và ghi âm câu trả lời</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-6">Chọn phần thi muốn luyện:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {parts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPart(p.id)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    selectedPart === p.id 
                    ? `border-${p.color}-500 bg-${p.color}-50 ring-1 ring-${p.color}-500` 
                    : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <p.icon className={`w-8 h-8 mb-4 text-${p.color}-600`} />
                  <h3 className={`text-lg font-bold text-${p.color}-700 mb-2`}>{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.desc}</p>
                </button>
              ))}
            </div>

            <button 
              onClick={handleStart}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              Vào phòng thu âm <ArrowRight />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SpeakingDashboard;