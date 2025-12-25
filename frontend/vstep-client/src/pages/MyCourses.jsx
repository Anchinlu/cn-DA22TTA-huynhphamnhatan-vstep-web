import React, { useState, useEffect } from 'react';
import { 
  Layout, History, BarChart2, Plus, 
  BookOpen, Award, Loader2, 
  PenTool, Headphones, Mic, Filter, Activity, CheckCircle2, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';

// === SUB-COMPONENTS ===

// 1. Tab Lớp học (Đã cập nhật tiếng Việt & Sắp xếp)
const MyClassesTab = ({ navigate }) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('vstep_token');
            const res = await fetch('http://localhost:5000/api/student/classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setClasses(data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchClasses();
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>Đang tải lớp học...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Lớp học của tôi</h3>
                <button onClick={() => navigate('/join-class')} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all hover:-translate-y-0.5">
                     <Plus size={18}/> Tham gia lớp mới
                </button>
            </div>
            {classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map((cls) => (
                    <div 
                        key={cls.id} 
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group" 
                        onClick={() => cls.trang_thai === 'approved' && navigate(`/class/${cls.id}`)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Layout className="w-6 h-6" />
                            </div>
                            {/* Trạng thái tiếng Việt */}
                            {cls.trang_thai === 'approved' ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase flex items-center gap-1">
                                    <CheckCircle2 size={12}/> Đã vào lớp
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase flex items-center gap-1 animate-pulse">
                                    <Clock size={12}/> Đang chờ duyệt
                                </span>
                            )}
                        </div>
                        
                        <h4 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{cls.ten_lop}</h4>
                        <p className="text-sm text-gray-500 mb-4">Giáo viên: <span className="font-medium text-gray-700">{cls.giao_vien}</span></p>
                        
                        <div className={`w-full py-2.5 text-sm font-bold rounded-lg text-center transition-colors ${
                            cls.trang_thai === 'approved' 
                            ? 'bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}>
                            {cls.trang_thai === 'approved' ? 'Truy cập lớp học' : 'Vui lòng chờ giáo viên duyệt'}
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Layout size={32}/>
                    </div>
                    <p className="text-gray-500 font-medium">Bạn chưa tham gia lớp học nào.</p>
                    <button onClick={() => navigate('/join-class')} className="mt-4 text-blue-600 font-bold hover:underline">Nhập mã lớp ngay</button>
                </div>
            )}
        </div>
    );
};

// 2. Tab Lịch sử (Có Xem tất cả & Bộ lọc)
const HistoryTab = ({ historyData }) => {
  const [filter, setFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [showAll, setShowAll] = useState(false); // State để mở rộng danh sách

  useEffect(() => {
    if (filter === 'all') {
      setFilteredData(historyData);
    } else {
      setFilteredData(historyData.filter(item => item.ky_nang.toLowerCase() === filter));
    }
    setShowAll(false); // Reset khi đổi filter
  }, [filter, historyData]);

  const getSkillConfig = (skill) => {
    switch(skill?.toLowerCase()) {
      case 'reading': return { color: 'text-green-600 bg-green-100', icon: BookOpen, label: 'Reading' };
      case 'writing': return { color: 'text-orange-600 bg-orange-100', icon: PenTool, label: 'Writing' };
      case 'listening': return { color: 'text-blue-600 bg-blue-100', icon: Headphones, label: 'Listening' };
      case 'speaking': return { color: 'text-red-600 bg-red-100', icon: Mic, label: 'Speaking' };
      default: return { color: 'text-gray-600 bg-gray-100', icon: Award, label: 'General' };
    }
  };

  // Cắt danh sách hiển thị
  const displayData = showAll ? filteredData : filteredData.slice(0, 5);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400"/> Lịch sử luyện tập
        </h3>
        
        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl overflow-x-auto max-w-full">
          {['all', 'listening', 'reading', 'writing', 'speaking'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all uppercase whitespace-nowrap ${
                filter === type 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 uppercase font-bold text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 pl-8">Kỹ năng</th>
                <th className="px-6 py-4">Đề thi</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Ngày làm</th>
                <th className="px-6 py-4 text-center pr-8">Điểm số</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayData.map((item) => {
                const config = getSkillConfig(item.ky_nang);
                const Icon = config.icon;
                return (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 pl-8">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${config.color}`}>
                        <Icon size={14} /> {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 max-w-[250px] truncate" title={item.tieu_de_bai_thi}>
                            {item.tieu_de_bai_thi || "Bài luyện tập tự do"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.trinh_do || 'B1'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {Math.floor(item.thoi_gian_lam / 60)}m {item.thoi_gian_lam % 60}s
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-center pr-8">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-black ${item.diem_so >= 8 ? 'text-green-600' : item.diem_so >= 5 ? 'text-blue-600' : 'text-red-500'}`}>
                            {item.diem_so}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Nút Xem tất cả / Thu gọn */}
          {filteredData.length > 5 && (
             <div className="p-4 text-center border-t border-gray-100 bg-gray-50/30">
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-full transition"
                >
                    {showAll ? (
                        <>Thu gọn danh sách <ChevronUp size={16}/></>
                    ) : (
                        <>Xem tất cả ({filteredData.length}) <ChevronDown size={16}/></>
                    )}
                </button>
             </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4 text-gray-400">
             <Filter size={24} />
          </div>
          <p className="text-gray-500 font-medium">Chưa có bài làm nào cho kỹ năng này.</p>
        </div>
      )}
    </div>
  );
};

// 3. Tab Thống kê (Giữ nguyên Charts đẹp)
const StatisticsTab = ({ historyData }) => {
  const [chartType, setChartType] = useState('radar'); // radar, bar, pie

  // Xử lý dữ liệu
  const processData = () => {
    const skills = { listening: [], reading: [], writing: [], speaking: [] };
    
    historyData.forEach(item => {
      const k = item.ky_nang.toLowerCase();
      if(skills[k]) skills[k].push(Number(item.diem_so));
    });

    const avgData = [
      { subject: 'Listening', A: skills.listening.length ? (skills.listening.reduce((a,b)=>a+b,0)/skills.listening.length).toFixed(1) : 0, fullMark: 10 },
      { subject: 'Reading', A: skills.reading.length ? (skills.reading.reduce((a,b)=>a+b,0)/skills.reading.length).toFixed(1) : 0, fullMark: 10 },
      { subject: 'Writing', A: skills.writing.length ? (skills.writing.reduce((a,b)=>a+b,0)/skills.writing.length).toFixed(1) : 0, fullMark: 10 },
      { subject: 'Speaking', A: skills.speaking.length ? (skills.speaking.reduce((a,b)=>a+b,0)/skills.speaking.length).toFixed(1) : 0, fullMark: 10 },
    ];

    const countData = [
       { name: 'Listening', value: skills.listening.length, fill: '#3b82f6' },
       { name: 'Reading', value: skills.reading.length, fill: '#10b981' },
       { name: 'Writing', value: skills.writing.length, fill: '#f97316' },
       { name: 'Speaking', value: skills.speaking.length, fill: '#ef4444' },
    ];

    return { avgData, countData };
  };

  const { avgData, countData } = processData();
  const totalTests = historyData.length;
  const overallAvg = totalTests > 0 ? (historyData.reduce((a, b) => a + Number(b.diem_so), 0) / totalTests).toFixed(1) : 0;

  // Custom Bar cho Skill Bars
  const SkillBar = ({ label, score, color, max = 10 }) => (
    <div className="mb-5">
      <div className="flex justify-between text-sm font-bold mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className={color}>{score}/{max}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`} 
          style={{ width: `${(score / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-blue-100 text-xs font-bold uppercase mb-1">Điểm trung bình</p>
                  <h3 className="text-4xl font-black">{overallAvg}</h3>
               </div>
               <div className="p-3 bg-white/20 rounded-xl"><Award className="w-6 h-6 text-white"/></div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
               <p className="text-gray-400 text-xs font-bold uppercase mb-1">Tổng bài thi</p>
               <h3 className="text-3xl font-black text-gray-800">{totalTests}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><BookOpen className="w-6 h-6"/></div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
               <p className="text-gray-400 text-xs font-bold uppercase mb-1">Kỹ năng mạnh nhất</p>
               <h3 className="text-xl font-bold text-green-600 uppercase">
                  {/* Tìm kỹ năng có điểm TB cao nhất */}
                  {avgData.reduce((prev, current) => (Number(prev.A) > Number(current.A)) ? prev : current).subject}
               </h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Activity className="w-6 h-6"/></div>
         </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <BarChart2 className="text-blue-600"/> Phân tích năng lực
            </h3>
            
            {/* Chart Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
               <button onClick={() => setChartType('radar')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartType === 'radar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Radar</button>
               <button onClick={() => setChartType('bar')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartType === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Cột</button>
               <button onClick={() => setChartType('pie')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartType === 'pie' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tròn</button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Biểu đồ */}
            <div className="lg:col-span-2 h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                {chartType === 'radar' ? (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={avgData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#9ca3af"/>
                        <Radar name="Điểm TB" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                        <Tooltip />
                    </RadarChart>
                ) : chartType === 'bar' ? (
                    <BarChart data={avgData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                        <XAxis dataKey="subject" tick={{fill:'#6b7280', fontSize:12}} axisLine={false} tickLine={false}/>
                        <YAxis domain={[0, 10]} tick={{fill:'#6b7280', fontSize:12}} axisLine={false} tickLine={false}/>
                        <Tooltip cursor={{fill: '#f9fafb'}}/>
                        <Bar dataKey="A" name="Điểm TB" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={60} />
                    </BarChart>
                ) : (
                    <RePieChart>
                        <Pie data={countData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                            {countData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </RePieChart>
                )}
                </ResponsiveContainer>
            </div>

            {/* Skill Bars bên phải biểu đồ */}
            <div className="lg:col-span-1 border-l border-gray-100 pl-8 flex flex-col justify-center">
                 <h4 className="font-bold text-gray-400 uppercase text-xs mb-6 tracking-wider">Chi tiết điểm số</h4>
                 {avgData.map((skill, index) => {
                     const colors = ['text-blue-600', 'text-green-600', 'text-orange-600', 'text-red-600'];
                     return (
                        <SkillBar key={index} label={skill.subject} score={skill.A} color={colors[index]} />
                     )
                 })}
            </div>
         </div>
      </div>
    </div>
  );
};

// === MAIN PAGE ===
const MyCourses = () => {
  const navigate = useNavigate();
  // Đổi thứ tự Tab: Classes -> History -> Stats
  const [activeTab, setActiveTab] = useState('classes'); 
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cấu hình Tabs mới
  const tabs = [
    { id: 'classes', label: 'Lớp học', icon: Layout },
    { id: 'history', label: 'Lịch sử', icon: History },
    { id: 'stats', label: 'Thống kê', icon: BarChart2 },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('vstep_token');
      if (!token) { navigate('/login'); return; }
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/results/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) setHistoryData(await response.json());
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard cá nhân</h1>
                <p className="text-gray-500 mt-1">Quản lý lớp học và theo dõi tiến độ luyện thi.</p>
            </div>
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex">
                {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all
                    ${activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
                ))}
            </div>
          </div>

          <div className="min-h-[400px]">
            {loading ? <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div> : (
              <>
                {activeTab === 'classes' && <MyClassesTab navigate={navigate} />}
                {activeTab === 'history' && <HistoryTab historyData={historyData} />}
                {activeTab === 'stats' && <StatisticsTab historyData={historyData} />}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyCourses;