import React, { useState, useEffect } from 'react';
import { 
  PenTool, Mail, FileText, 
  CheckCircle2, BookOpen, Briefcase, Globe, Cpu, Zap, 
  ArrowRight, Clock, AlertCircle, BarChart3, History 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const WritingDashboard = () => {
  const navigate = useNavigate();
  
  // State quản lý lựa chọn
  const [selectedTask, setSelectedTask] = useState('task1'); // task1 / task2
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [selectedTopicId, setSelectedTopicId] = useState(''); // ID số từ DB

  // State dữ liệu
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [topics, setTopics] = useState([]); // Danh sách chủ đề từ API
  const [loading, setLoading] = useState(false);

  // Cấu hình Task (Giữ nguyên vì đây là hằng số giao diện)
  const tasks = [
    { 
      id: 'task1', 
      name: 'Task 1: Viết thư', 
      desc: 'Viết email/thư phản hồi (~120 từ).', 
      icon: Mail,
      color: 'blue'
    },
    { 
      id: 'task2', 
      name: 'Task 2: Viết luận', 
      desc: 'Viết bài luận xã hội (~250 từ).', 
      icon: FileText,
      color: 'orange'
    },
  ];

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

  // 2. Fetch Danh sách đề thi (List)
  useEffect(() => {
    if (!selectedTopicId) return; // Chưa có topic thì chưa load

    const fetchTests = async () => {
      setLoading(true);
      try {
        // Gọi API với ID số thực tế
        const res = await fetch(`http://localhost:5000/api/writing/list?level=${selectedLevel}&topic=${selectedTopicId}&task=${selectedTask}`);
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
  }, [selectedLevel, selectedTopicId, selectedTask]);

  // 3. Fetch Lịch sử làm bài
  useEffect(() => {
    const fetchHistory = async () => {
        const token = localStorage.getItem('vstep_token');
        if(!token) return;
        try {
            const res = await fetch(`http://localhost:5000/api/writing/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) setHistory(await res.json());
        } catch (e) { console.error(e); }
    };
    fetchHistory();
  }, []);

  const handleStart = (testId) => {
    navigate('/practice/writing/test', { 
      state: { 
        task: selectedTask, 
        topicId: selectedTopicId, // Truyền ID số
        level: selectedLevel,
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
                <div className="bg-gradient-to-r from-indigo-800 to-purple-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <PenTool className="w-8 h-8"/> Luyện Viết VSTEP
                        </h1>
                        <p className="text-indigo-100 opacity-90 max-w-lg">
                            Chọn dạng bài và chủ đề để bắt đầu. Trợ lí AI sẽ chấm điểm và sửa lỗi chi tiết cho bạn ngay lập tức.
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10"><PenTool size={150} /></div>
                </div>

                {/* Bộ lọc */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    
                    {/* 1. Chọn Task */}
                    <h3 className="font-bold text-gray-800 mb-4">1. Chọn dạng bài</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {tasks.map((task) => (
                        <button
                            key={task.id}
                            onClick={() => setSelectedTask(task.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3
                            ${selectedTask === task.id 
                                ? `border-${task.color}-500 bg-${task.color}-50 ring-1 ring-${task.color}-200` 
                                : 'border-gray-100 hover:border-gray-300'}`}
                        >
                            <div className={`mt-1 p-2 rounded-lg bg-${task.color}-100 text-${task.color}-600`}><task.icon size={20}/></div>
                            <div>
                                <h4 className={`font-bold text-${task.color}-700`}>{task.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{task.desc}</p>
                            </div>
                            {selectedTask === task.id && <CheckCircle2 className={`ml-auto text-${task.color}-600`} size={20}/>}
                        </button>
                        ))}
                    </div>

                    {/* 2. Trình độ & Chủ đề */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3">2. Trình độ</h3>
                            <div className="flex gap-2">
                                {['B1', 'B2', 'C1'].map(lvl => (
                                    <button key={lvl} onClick={() => setSelectedLevel(lvl)}
                                        className={`flex-1 py-2 rounded-lg font-bold border transition-all ${selectedLevel === lvl ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3">3. Chủ đề</h3>
                            <select 
                                value={selectedTopicId} 
                                onChange={(e) => setSelectedTopicId(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-300 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {topics.length > 0 ? (
                                    topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                                ) : (
                                    <option>Đang tải chủ đề...</option>
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Danh sách đề thi */}
                <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">4</span>
                        Danh sách đề bài
                    </h3>
                    
                    {loading ? <div className="text-center py-10 text-gray-400">Đang tải đề...</div> : 
                     tests.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {tests.map((test, index) => (
                                <div key={test.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">{index + 1}</div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">{test.title}</h4>
                                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><Clock size={14}/> {selectedTask === 'task1' ? '20' : '40'} phút</span>
                                                <span className="flex items-center gap-1"><PenTool size={14}/> {selectedTask === 'task1' ? 'Thư' : 'Luận'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleStart(test.id)} className="px-5 py-2 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2">
                                        Viết bài <ArrowRight size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl text-center border border-dashed border-gray-300">
                            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2"/>
                            <p className="text-gray-500">Chưa có đề nào cho bộ lọc này.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CỘT PHẢI: LỊCH SỬ (1/3) --- */}
            <div className="space-y-6">
                {/* Thống kê */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-orange-500"/> Thống kê Writing</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-black text-orange-600">{history.length}</div>
                            <div className="text-xs text-orange-800 font-medium">Bài đã viết</div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-black text-indigo-600">{history.length > 0 ? (history.reduce((a,b) => a + Number(b.diem_so), 0) / history.length).toFixed(1) : 0}</div>
                            <div className="text-xs text-indigo-800 font-medium">Điểm TB</div>
                        </div>
                    </div>
                </div>

                {/* Lịch sử */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50"><h4 className="font-bold text-gray-800 flex items-center gap-2"><History size={18}/> Bài viết gần đây</h4></div>
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                        {history.map((h, i) => (
                            <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm text-gray-800 truncate max-w-[150px]" title={h.tieu_de_bai_thi}>
                                        {h.tieu_de_bai_thi}
                                    </span>
                                    <span className={`font-bold ${h.diem_so >= 5 ? 'text-green-600' : 'text-red-500'}`}>{h.diem_so}/10</span>
                                </div>
                                <div className="text-xs text-gray-400 flex justify-between">
                                    <span>{h.ngay_lam}</span>
                                    <span>{Math.round(h.thoi_gian_lam / 60)} phút</span>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">Chưa có bài viết nào.</div>}
                    </div>
                </div>
            </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WritingDashboard;