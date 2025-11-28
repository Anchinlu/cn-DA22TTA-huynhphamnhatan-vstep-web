import React, { useState, useEffect } from 'react';
import { 
  Layout, History, BarChart2, Plus, 
  Calendar, Clock, CheckCircle2, TrendingUp, 
  BookOpen, Award, ArrowRight, Loader2, AlertCircle,
  PenTool, Headphones, Mic
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// --- SUB-COMPONENTS (Giao diện con) ---

// Component Tab 1: Lớp học của tôi (Lấy dữ liệu thật từ API)
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>Đang tải lớp học...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Lớp học đang tham gia</h3>
        <button 
          onClick={() => navigate('/join-class')}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Tham gia lớp mới
        </button>
      </div>

      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                {/* === SỬA ĐOẠN NÀY: HIỂN THỊ TRẠNG THÁI === */}
                {cls.trang_thai === 'approved' ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3"/> Đang học
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3"/> Chờ duyệt
                  </span>
                )}
                {/* ========================================= */}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">{cls.ten_lop}</h4>
              <p className="text-sm text-gray-500 mb-4">GV: {cls.giao_vien} • Mã: {cls.ma_lop}</p>
              
              <button 
                disabled={cls.trang_thai !== 'approved'}
                onClick={() => navigate(`/class/${cls.id}`)}
                className={`w-full py-2 text-sm font-bold rounded-lg transition-colors
                  ${cls.trang_thai === 'approved' 
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'}
                `}
              >
                {cls.trang_thai === 'approved' ? 'Vào lớp học' : 'Đang chờ giáo viên...'}
                
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State (Giữ nguyên như cũ) */
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layout className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">Chưa tham gia lớp học nào</h4>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Hãy tham gia lớp học do giáo viên tổ chức để nhận bài tập và lộ trình học tập bài bản.
          </p>
          <button 
            onClick={() => navigate('/join-class')}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Nhập mã lớp ngay
          </button>
        </div>
      )}
    </div>
  );
};

// 2. Tab Lịch sử (Dữ liệu thật từ API)
const HistoryTab = ({ historyData }) => {
  // Hàm helper để chọn màu và icon theo kỹ năng
  const getSkillConfig = (skill) => {
    switch(skill?.toLowerCase()) {
      case 'reading': return { color: 'green', icon: BookOpen, label: 'Reading' };
      case 'writing': return { color: 'orange', icon: PenTool, label: 'Writing' };
      case 'listening': return { color: 'blue', icon: Headphones, label: 'Listening' };
      case 'speaking': return { color: 'red', icon: Mic, label: 'Speaking' };
      default: return { color: 'gray', icon: Award, label: 'General' };
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Bài luyện gần đây</h3>
        <span className="text-sm font-medium text-gray-500">Hiển thị {historyData.length} kết quả mới nhất</span>
      </div>
      
      {historyData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Kỹ năng / Đề thi</th>
                <th className="px-6 py-4">Trình độ</th>
                <th className="px-6 py-4">Thời gian làm</th>
                <th className="px-6 py-4">Ngày nộp</th>
                <th className="px-6 py-4 text-center">Điểm số</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historyData.map((item) => {
                const config = getSkillConfig(item.ky_nang);
                const Icon = config.icon;
                return (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${config.color}-100 text-${config.color}-600`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 capitalize">{config.label}</p>
                          <p className="text-xs text-gray-500">Practice Test</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        {item.trinh_do || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono">
                      {Math.floor(item.thoi_gian_lam / 60)}m {item.thoi_gian_lam % 60}s
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        item.diem_so >= 8.0 ? 'bg-green-100 text-green-700' :
                        item.diem_so >= 5.0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.diem_so}/10
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Bạn chưa làm bài thi nào.</p>
          <button className="mt-4 text-blue-600 font-bold hover:underline">Đến trang Luyện thi ngay</button>
        </div>
      )}
    </div>
  );
};

// 3. Tab Thống kê (Tính toán Realtime)
const StatisticsTab = ({ historyData }) => {
  // Logic tính toán thống kê từ dữ liệu thật
  const totalTests = historyData.length;
  
  // Tính điểm trung bình
  const avgScore = totalTests > 0 
    ? (historyData.reduce((sum, item) => sum + item.diem_so, 0) / totalTests).toFixed(1) 
    : 0;

  // Tính tổng thời gian học (phút)
  const totalTimeMinutes = totalTests > 0 
    ? Math.round(historyData.reduce((sum, item) => sum + item.thoi_gian_lam, 0) / 60) 
    : 0;

  // Đếm số bài theo kỹ năng
  const skillsCount = historyData.reduce((acc, item) => {
    const skill = item.ky_nang.toLowerCase();
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cards Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Bài đã làm</p>
            <h4 className="text-3xl font-black text-gray-900">{totalTests}</h4>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl shadow-sm">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Phút luyện tập</p>
            <h4 className="text-3xl font-black text-gray-900">{totalTimeMinutes}</h4>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-green-100 text-green-600 rounded-2xl shadow-sm">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Điểm trung bình</p>
            <h4 className="text-3xl font-black text-gray-900">{avgScore}</h4>
          </div>
        </div>
      </div>

      {/* Biểu đồ phân bố kỹ năng */}
      <div className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" /> Phân bố bài làm
        </h3>
        <div className="space-y-6">
          {[
            { label: 'Listening', val: skillsCount['listening'] || 0, color: 'bg-blue-500', text: 'text-blue-600' },
            { label: 'Reading', val: skillsCount['reading'] || 0, color: 'bg-green-500', text: 'text-green-600' },
            { label: 'Writing', val: skillsCount['writing'] || 0, color: 'bg-orange-500', text: 'text-orange-600' },
            { label: 'Speaking', val: skillsCount['speaking'] || 0, color: 'bg-red-500', text: 'text-red-600' }
          ].map((stat) => (
            <div key={stat.label}>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-gray-600">{stat.label}</span>
                <span className={stat.text}>{stat.val} bài</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-4 rounded-full ${stat.color} transition-all duration-1000`} 
                  style={{ width: `${totalTests > 0 ? (stat.val / totalTests) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// === TRANG CHÍNH ===
const MyCourses = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history'); // Mặc định vào History để xem kết quả
  
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'classes', label: 'Lớp học', icon: Layout },
    { id: 'history', label: 'Lịch sử luyện thi', icon: History },
    { id: 'stats', label: 'Thống kê', icon: BarChart2 },
  ];

  // --- GỌI API LẤY DỮ LIỆU THẬT ---
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('vstep_token');
      if (!token) {
        navigate('/dang-nhap');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/results/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHistoryData(data);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />

      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900">Dashboard cá nhân</h1>
            <p className="text-gray-500 mt-2 text-lg">Chào mừng trở lại! Đây là tổng quan quá trình học tập của bạn.</p>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all
                  ${activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            ) : (
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