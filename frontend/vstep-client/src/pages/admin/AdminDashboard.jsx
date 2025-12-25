import React, { useState, useEffect } from 'react';
import { 
  Users, School, Shield, UserPlus, 
  ArrowRight, Activity, Server 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeacherRequestList from './TeacherRequestList';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    recentUsers: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('vstep_token');
        const res = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setStats(await res.json());
      } catch (err) { console.error(err); } 
    };
    fetchStats();
  }, []);

  // Card thống kê
  const statCards = [
    { title: 'Tổng Học viên', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Tổng Giáo viên', value: stats.totalTeachers, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Lớp học hoạt động', value: stats.totalClasses, icon: School, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Server Status', value: 'Online', icon: Server, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header Admin */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Trung tâm Quản trị Hệ thống</h1>
            <p className="text-slate-400">Theo dõi toàn bộ hoạt động của nền tảng VSTEP Pro.</p>
         </div>
         <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-600 to-transparent opacity-20"></div>
         <Activity size={64} className="text-indigo-500 opacity-50 relative z-10"/>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {statCards.map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
                     <h3 className="text-3xl font-black text-gray-800 mt-1">{card.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                     <card.icon size={24}/>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* 3. Teacher Request List (MỚI THÊM) */}
      <div className="mt-8">
        <TeacherRequestList />
      </div>

      {/* 4. Recent Users & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Cột Trái: Người dùng mới */}
         <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <UserPlus className="text-blue-500" size={20}/> Người dùng mới đăng ký
               </h3>
               <button onClick={() => navigate('/admin/users')} className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</button>
            </div>
            <div className="divide-y divide-gray-50">
               {stats.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map(u => (
                     <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${u.vai_tro_id === 2 ? 'bg-purple-500' : 'bg-blue-500'}`}>
                              {u.ho_ten.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-gray-800 text-sm">{u.ho_ten}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.vai_tro_id === 2 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {u.vai_tro_id === 2 ? 'Giáo viên' : 'Học viên'}
                           </span>
                           <p className="text-[10px] text-gray-400 mt-1">{new Date(u.ngay_tao).toLocaleDateString('vi-VN')}</p>
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">Chưa có dữ liệu.</div>
               )}
            </div>
         </div>

         {/* Cột Phải: Phím tắt quản lý */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-4">Phím tắt quản lý</h3>
            <div className="space-y-3">
               <button onClick={() => navigate('/admin/users')} className="w-full p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition flex items-center justify-between group">
                  <span className="font-bold text-gray-600 group-hover:text-blue-700">Quản lý User</span>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-500"/>
               </button>
               <button onClick={() => navigate('/admin/classes')} className="w-full p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition flex items-center justify-between group">
                  <span className="font-bold text-gray-600 group-hover:text-purple-700">Quản lý Lớp học</span>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-purple-500"/>
               </button>
            </div>
         </div>

      </div>
    </div>
  );
};

export default AdminDashboard;