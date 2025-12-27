import React, { useState, useEffect } from 'react';
import { 
  Mic, MessageCircle, Users, BrainCircuit, 
  ArrowRight, BarChart3, History, Play, AlertCircle,
  BookOpen, Briefcase, Globe, Cpu, Zap 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const SpeakingDashboard = () => {
  const navigate = useNavigate();
  
  // State quản lý lựa chọn
  const [selectedPart, setSelectedPart] = useState('1'); // 1, 2, 3
  const [selectedTopicId, setSelectedTopicId] = useState(''); // ID số từ DB

  // State dữ liệu
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [topics, setTopics] = useState([]); // Danh sách chủ đề từ API
  const [loading, setLoading] = useState(false);

  // Cấu hình Parts (Giữ nguyên vì đây là hằng số giao diện)
  const parts = [
    { 
      id: '1', 
      name: 'Part 1: Tương tác xã hội', 
      desc: 'Trả lời 3-6 câu hỏi ngắn về bản thân (3-4 phút).', 
      icon: MessageCircle, 
      color: 'blue' 
    },
    { 
      id: '2', 
      name: 'Part 2: Thảo luận giải pháp', 
      desc: 'Chọn 1 trong 3 phương án và giải thích lý do (4 phút).', 
      icon: Users, 
      color: 'green' 
    },
    { 
      id: '3', 
      name: 'Part 3: Phát triển chủ đề', 
      desc: 'Thuyết trình về một chủ đề dựa trên sơ đồ tư duy (5 phút).', 
      icon: BrainCircuit, 
      color: 'purple' 
    },
  ];

  // Helper map icon cho topic (Vì DB chưa lưu icon)
  const getTopicIcon = (slug) => {
      if (slug?.includes('doi-song') || slug?.includes('daily')) return <BookOpen size={16}/>;
      if (slug?.includes('cong-nghe') || slug?.includes('tech')) return <Cpu size={16}/>;
      if (slug?.includes('kinh-te') || slug?.includes('business')) return <Briefcase size={16}/>;
      if (slug?.includes('moi-truong') || slug?.includes('environment')) return <Globe size={16}/>;
      if (slug?.includes('du-lich') || slug?.includes('travel')) return <Zap size={16}/>;
      return <BookOpen size={16}/>;
  };

  // 1. Fetch Danh sách Topics (MỚI)
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/topics')
      .then(res => res.json())
      .then(data => {
        setTopics(data);
        // Tự động chọn topic đầu tiên nếu có
        if (data.length > 0 && !selectedTopicId) {
            setSelectedTopicId(data[0].id);
        }
      })
      .catch(err => console.error("Lỗi load topics:", err));
  }, []);

  // 2. Fetch Danh sách đề thi
  useEffect(() => {
    if (!selectedTopicId) return;

    const fetchTests = async () => {
      setLoading(true);
      try {
        // Gọi API với ID số thực tế
        const res = await fetch(`http://localhost:5000/api/speaking/list?part=${selectedPart}&topic=${selectedTopicId}`);
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
  }, [selectedPart, selectedTopicId]);

  // 3. Fetch Lịch sử
  useEffect(() => {
    const fetchHistory = async () => {
        const token = localStorage.getItem('vstep_token');
        if(!token) return;
        try {
            const res = await fetch(`http://localhost:5000/api/speaking/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) setHistory(await res.json());
        } catch (e) { console.error(e); }
    };
    fetchHistory();
  }, []);

  const handleStart = (testId) => {
    navigate('/practice/speaking/test', { 
      state: { 
        part: selectedPart, 
        topicId: selectedTopicId, // Truyền ID số
        testId: testId 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- CỘT TRÁI: BỘ LỌC & DANH SÁCH (2/3) --- */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Header Card */}
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Mic className="w-8 h-8"/> Luyện Nói VSTEP
                        </h1>
                        <p className="text-orange-100 opacity-90 max-w-lg">
                            Luyện tập phản xạ, ghi âm và nhận đánh giá phát âm từ AI.
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10"><Mic size={150} /></div>
                </div>

                {/* Bộ lọc */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    
                    {/* 1. Chọn Phần thi */}
                    <h3 className="font-bold text-gray-800 mb-4">1. Chọn phần thi (Part)</h3>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        {parts.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPart(p.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4
                            ${selectedPart === p.id 
                                ? `border-orange-500 bg-orange-50 ring-1 ring-orange-200` 
                                : 'border-gray-100 hover:border-gray-300'}`}
                        >
                            <div className={`p-3 rounded-full bg-${p.color}-100 text-${p.color}-600`}>
                                <p.icon size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800">{p.name}</h4>
                                <p className="text-xs text-gray-500">{p.desc}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPart === p.id ? 'border-orange-600 bg-orange-600' : 'border-gray-300'}`}>
                                {selectedPart === p.id && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </button>
                        ))}
                    </div>

                    {/* 2. Chọn Chủ đề */}
                    <h3 className="font-bold text-gray-800 mb-4">2. Chọn chủ đề</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {topics.length > 0 ? topics.map(t => (
                            <button 
                                key={t.id}
                                onClick={() => setSelectedTopicId(t.id)}
                                className={`p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2
                                    ${selectedTopicId === t.id 
                                    ? 'bg-orange-600 text-white border-orange-600 shadow-md' 
                                    : 'border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-200'}`}
                            >
                                {getTopicIcon(t.slug)} {t.name}
                            </button>
                        )) : (
                            <p className="text-gray-400 text-sm col-span-3 text-center">Đang tải chủ đề...</p>
                        )}
                    </div>
                </div>

                {/* Danh sách đề thi */}
                <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">3</span>
                        Danh sách câu hỏi
                    </h3>
                    
                    {loading ? <div className="text-center py-10 text-gray-400">Đang tải đề...</div> : 
                     tests.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {tests.map((test, index) => (
                                <div key={test.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">{index + 1}</div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition-colors line-clamp-1">{test.title}</h4>
                                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">Part {test.part}</span>
                                                <span className="flex items-center gap-1">• Speaking</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleStart(test.id)} className="px-5 py-2 bg-white border-2 border-orange-600 text-orange-600 font-bold rounded-lg hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2">
                                        Luyện tập <Play size={16} fill="currentColor"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl text-center border border-dashed border-gray-300">
                            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2"/>
                            <p className="text-gray-500">Chưa có đề nào cho chủ đề này.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CỘT PHẢI: LỊCH SỬ (1/3) --- */}
            <div className="space-y-6">
                {/* Thống kê */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-orange-500"/> Thống kê</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-black text-orange-600">{history.length}</div>
                            <div className="text-xs text-orange-800 font-medium">Bài đã nói</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-black text-blue-600">{history.length > 0 ? (history.reduce((a,b) => a + Number(b.diem_so), 0) / history.length).toFixed(1) : 0}</div>
                            <div className="text-xs text-blue-800 font-medium">Điểm TB</div>
                        </div>
                    </div>
                </div>

                {/* Lịch sử */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50"><h4 className="font-bold text-gray-800 flex items-center gap-2"><History size={18}/> Lịch sử luyện tập</h4></div>
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                        {history.map((h, i) => (
                            <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm text-gray-800 truncate max-w-[150px]" title={h.tieu_de_bai_thi}>
                                        {h.tieu_de_bai_thi || "Bài nói tự do"}
                                    </span>
                                    <span className={`font-bold ${h.diem_so >= 5 ? 'text-green-600' : 'text-red-500'}`}>{h.diem_so}/10</span>
                                </div>
                                <div className="text-xs text-gray-400 flex justify-between">
                                    <span>{h.ngay_lam}</span>
                                    <span>Speaking</span>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">Chưa có bài tập nào.</div>}
                    </div>
                </div>
            </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SpeakingDashboard;