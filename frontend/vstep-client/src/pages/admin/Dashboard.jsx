import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import { 
  Users, BookOpen, School, Clock, 
  TrendingUp, Activity, Calendar, Loader2,
  BarChart3, FileText, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// --- 1. COMPONENT DASHBOARD GIÁO VIÊN ---
const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingStudents: 0,
    totalAssignments: 0,
    chartData: [], // Dữ liệu biểu đồ từ API
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
          // Nếu backend chưa trả về chartData, ta dùng dữ liệu giả lập để hiển thị UI
          const mockChartData = [
            { name: 'Thứ 2', visits: 12 },
            { name: 'Thứ 3', visits: 19 },
            { name: 'Thứ 4', visits: 15 },
            { name: 'Thứ 5', visits: 22 },
            { name: 'Thứ 6', visits: 30 },
            { name: 'Thứ 7', visits: 25 },
            { name: 'CN', visits: 40 },
          ];
          setStats({ ...data, chartData: data.chartData || mockChartData });
        }
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getDateInfo = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return { day, dayOfWeek: days[date.getDay()] };
  };

  const statCards = [
    { title: 'Lớp học', value: stats.totalClasses, icon: School, color: 'bg-blue-600', shadow: 'shadow-blue-100', desc: 'Đang hoạt động' },
    { title: 'Học viên', value: stats.totalStudents, icon: Users, color: 'bg-emerald-600', shadow: 'shadow-emerald-100', desc: 'Tổng số học sinh' },
    { title: 'Chấm bài', value: stats.totalAssignments, icon: FileText, color: 'bg-violet-600', shadow: 'shadow-violet-100', desc: 'Bài Writing/Speaking' },
    { title: 'Yêu cầu', value: stats.pendingStudents, icon: Clock, color: 'bg-orange-500', shadow: 'shadow-orange-100', desc: 'Học viên mới', alert: stats.pendingStudents > 0 },
  ];

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
      <p className="text-slate-500 font-medium animate-pulse">Đang đồng bộ dữ liệu hệ thống...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">Chào mừng trở lại, {user?.hoTen}! 👋</h1>
          <p className="text-slate-400 max-w-md">Hệ thống ghi nhận có {stats.pendingStudents} yêu cầu tham gia lớp học đang chờ bạn phê duyệt.</p>
          <button className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20">
            Xem yêu cầu duyệt <ArrowUpRight size={18}/>
          </button>
        </div>
        {/* Decor circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl text-white ${card.color} ${card.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon size={24} />
                </div>
                {card.alert && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                <h3 className="text-4xl font-black text-slate-800 mt-1">{card.value}</h3>
                <p className="text-xs text-slate-500 mt-2 font-medium">{card.desc}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* BIỂU ĐỒ HOẠT ĐỘNG THỰC TẾ */}
         <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                 <TrendingUp className="text-indigo-600" size={24}/> Lượt làm bài thi thử
              </h3>
              <select className="text-xs font-bold bg-slate-50 border-none rounded-lg focus:ring-2 ring-indigo-500">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
              </select>
            </div>
            
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    />
                    <Area type="monotone" dataKey="visits" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Lịch làm việc */}
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
               <Calendar className="text-orange-500" size={24}/> Hạn chót sắp tới
            </h3>
            <div className="space-y-4">
               {stats.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
                  stats.upcomingDeadlines.map((item) => {
                    const { day, dayOfWeek } = getDateInfo(item.han_nop);
                    return (
                       <div key={item.id} className="flex gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-200 hover:bg-white transition-all cursor-pointer group">
                          <div className="bg-white text-indigo-600 font-black w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                             <div className="text-[10px] uppercase opacity-60">{dayOfWeek}</div>
                             <div className="text-xl leading-none">{day}</div>
                          </div>
                          <div className="flex-1 overflow-hidden">
                             <p className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">{item.tieu_de}</p>
                             <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-md">Lớp {item.ma_lop}</span>
                             </div>
                          </div>
                       </div>
                    );
                  })
               ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Activity size={48} className="opacity-20 mb-3" />
                    <p className="text-sm italic">Không có deadline nào</p>
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
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('vstep_user'));
    if (!userData) {
      navigate('/dang-nhap');
    } else {
      setUser(userData);
    }
  }, [navigate]);

  if (!user) return null;

  // Xử lý trường hợp Học viên (Role 1) đi nhầm vào trang Dashboard Admin/Teacher
  if (user.vaiTroId === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl">
          <AlertCircle size={64} className="text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Khu vực dành cho Giáo viên</h2>
          <p className="text-slate-500 mb-6">Bạn không có quyền truy cập vào trang thống kê quản trị này.</p>
          <button onClick={() => navigate('/practice')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition">
            Quay lại trang Luyện thi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {user.vaiTroId === 3 ? <AdminDashboard /> : <TeacherDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;