import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import { 
  Users, BookOpen, School, Clock, 
  TrendingUp, Activity, Calendar, Loader2,
  FileText, AlertCircle, ArrowUpRight, Timer, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const getTimeRemaining = (dueDate) => {
  const total = Date.parse(dueDate) - Date.parse(new Date());
  if (total <= 0) return { text: "Đã hết hạn", color: "text-red-500", bg: "bg-red-50" };
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

  if (days > 0) return { text: `Còn ${days} ngày`, color: "text-orange-600", bg: "bg-orange-50" };
  return { text: `Còn ${hours} giờ`, color: "text-red-600", bg: "bg-red-50" };
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    totalAssignments: 0,
    submissionChart: [],
    upcomingDeadlines: []
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('vstep_user') || '{}');
    setUser(userData);

    const fetchTeacherStats = async () => {
      try {
        const token = localStorage.getItem('vstep_token');
        const res = await fetch('http://localhost:5000/api/dashboard/teacher/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Lỗi tải thống kê giáo viên:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStats();
  }, []);

  const statCards = [
    { title: 'Lớp học', value: stats.totalClasses, icon: School, color: 'bg-blue-600', desc: 'Đang quản lý' },
    { title: 'Học viên', value: stats.totalStudents, icon: Users, color: 'bg-emerald-600', desc: 'Trong các lớp' },
    { title: 'Bài chờ chấm', value: stats.pendingSubmissions, icon: FileText, color: 'bg-orange-500', desc: 'Cần kiểm tra ngay', alert: stats.pendingSubmissions > 0 },
    { title: 'Bài tập đã giao', value: stats.totalAssignments, icon: BookOpen, color: 'bg-violet-600', desc: 'Trên tất cả các lớp' },
  ];

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
      <p className="text-slate-500 font-medium">Đang tải dữ liệu giảng dạy...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">Chào thầy/cô, {user?.hoTen}!</h1>
          <p className="text-slate-400">Bạn có <span className="text-orange-400 font-bold">{stats.pendingSubmissions} bài tập</span> mới từ học sinh chưa được chấm điểm.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
           <BookOpen size={180} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl text-white ${card.color} shadow-lg`}>
                  <card.icon size={24} />
                </div>
                {card.alert && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span></span>}
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                <h3 className="text-4xl font-black text-slate-800">{card.value}</h3>
                <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* BIỂU ĐỒ NỘP BÀI THỰC TẾ CỦA LỚP */}
         <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-8">
               <TrendingUp className="text-indigo-600" size={24}/> Tiến độ nộp bài tập (7 ngày qua)
            </h3>
            <div className="h-72 w-full min-h-[288px]"> {/* Thêm min-h để giữ khung */}
               {stats.submissionChart && stats.submissionChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={stats.submissionChart}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={4} fillOpacity={0.1} fill="#4f46e5" />
                     </AreaChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                     <BarChart3 size={48} className="text-slate-200 mb-2" />
                     <p className="text-slate-400 text-sm italic">Chưa có dữ liệu nộp bài trong tuần qua</p>
                  </div>
               )}
            </div>
         </div>

         <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
               <Timer className="text-red-500" size={24}/> Deadline sắp kết thúc
            </h3>
            <div className="space-y-4">
               {stats.upcomingDeadlines.length > 0 ? (
                  stats.upcomingDeadlines.map((item) => {
                    const timeInfo = getTimeRemaining(item.han_nop);
                    return (
                       <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded uppercase">
                                Lớp: {item.ten_lop}
                             </span>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${timeInfo.bg} ${timeInfo.color}`}>
                                {timeInfo.text}
                             </span>
                          </div>
                          <p className="font-bold text-slate-800 text-sm mb-1">{item.tieu_de}</p>
                          <div className="flex items-center text-[10px] text-slate-400 font-medium">
                             <Calendar size={12} className="mr-1"/> Hạn: {new Date(item.han_nop).toLocaleDateString('vi-VN')}
                          </div>
                       </div>
                    );
                  })
               ) : (
                  <div className="text-center py-10 text-slate-400 italic">Không có bài tập nào sắp hết hạn.</div>
               )}
            </div>
            <button className="w-full mt-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-sm">
               Xem tất cả bài tập
            </button>
         </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('vstep_user'));
    if (!userData) navigate('/dang-nhap');
    else setUser(userData);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {user.vaiTroId === 3 ? <AdminDashboard /> : <TeacherDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;