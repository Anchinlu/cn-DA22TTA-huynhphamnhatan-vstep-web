import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard'; // Import trang Admin mới
import { 
  Users, BookOpen, School, Clock, 
  TrendingUp, Activity, Calendar, Loader2
} from 'lucide-react';

// --- 1. COMPONENT DASHBOARD GIÁO VIÊN (Nội bộ) ---
const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingStudents: 0,
    totalAssignments: 0,
    upcomingDeadlines: []
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('vstep_user') || '{}');
    setUser(userData);

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('vstep_token');
        const res = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Helper lấy ngày tháng
  const getDateInfo = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayOfWeek = days[date.getDay()];
    return { day, dayOfWeek };
  };

  const statCards = [
    { title: 'Lớp học', value: stats.totalClasses, icon: School, color: 'bg-blue-500', desc: 'Đang quản lý' },
    { title: 'Học viên', value: stats.totalStudents, icon: Users, color: 'bg-green-500', desc: 'Tổng thành viên' },
    { title: 'Bài tập', value: stats.totalAssignments, icon: BookOpen, color: 'bg-purple-500', desc: 'Đã giao' },
    { title: 'Chờ duyệt', value: stats.pendingStudents, icon: Clock, color: 'bg-orange-500', desc: 'Yêu cầu mới', alert: stats.pendingStudents > 0 },
  ];

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600"/></div>;

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Xin chào, {user?.hoTen || 'Giáo viên'}! 👋</h1>
          <p className="text-slate-300">Chúc bạn một ngày làm việc hiệu quả.</p>
        </div>
        <Activity size={64} className="text-indigo-400 opacity-50 hidden md:block"/>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{card.title}</p>
                  <h3 className="text-3xl font-black text-gray-800">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-xl text-white shadow-lg ${card.color} group-hover:scale-110 transition-transform`}>
                  <card.icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-gray-400">
                 {card.alert && <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></span>}
                 {card.desc}
              </div>
            </div>
          ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Placeholder Biểu đồ */}
         <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
               <TrendingUp className="text-blue-500" size={20}/> Hoạt động gần đây
            </h3>
            <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border-dashed border-2 border-gray-200">
               <p className="text-gray-400 italic">Biểu đồ thống kê sẽ hiển thị ở đây.</p>
            </div>
         </div>

         {/* Lịch làm việc (Dữ liệu thật) */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Calendar className="text-orange-500" size={20}/> Deadline sắp tới
            </h3>
            <div className="space-y-4">
               {stats.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
                  stats.upcomingDeadlines.map((item) => {
                    const { day, dayOfWeek } = getDateInfo(item.han_nop);
                    return (
                       <div key={item.id} className="flex gap-3 items-start p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition">
                          <div className="bg-white text-blue-600 font-bold p-2 rounded-lg text-center min-w-[50px] shadow-sm">
                             <div className="text-xs text-gray-400">{dayOfWeek}</div>
                             <div className="text-lg">{day}</div>
                          </div>
                          <div className="overflow-hidden">
                             <p className="font-bold text-blue-900 text-sm truncate" title={item.tieu_de}>{item.tieu_de}</p>
                             <p className="text-xs text-blue-700">Lớp: {item.ma_lop}</p>
                          </div>
                       </div>
                    );
                  })
               ) : (
                  <div className="text-center py-8 text-gray-400 text-sm italic">
                    Không có bài tập nào sắp đến hạn.
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

// --- 2. COMPONENT ĐIỀU HƯỚNG CHÍNH ---
const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('vstep_user'));
    if (userData) setUser(userData);
  }, []);

  if (!user) return null;

  // Role ID 3 -> Admin Dashboard
  // Role ID 2 -> Teacher Dashboard
  return user.vaiTroId === 3 ? <AdminDashboard /> : <TeacherDashboard />;
};

export default Dashboard;