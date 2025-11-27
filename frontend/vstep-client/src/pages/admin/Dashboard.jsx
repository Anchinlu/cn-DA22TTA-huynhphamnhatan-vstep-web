import React from 'react';
import { Users, BookOpen, FileCheck, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
    <div className={`p-4 rounded-xl bg-${color}-50 text-${color}-600`}>
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-gray-900">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('vstep_user'));
  const isTeacher = user?.vaiTroId === 2;

  return (
    <div className="space-y-8">
      {/* Lời chào */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Xin chào, {user?.hoTen}! 👋
        </h1>
        <p className="text-gray-500 mt-2">
          {isTeacher 
            ? "Đây là khu vực quản lý lớp học và chấm bài của bạn." 
            : "Đây là trung tâm quản trị toàn bộ hệ thống VSTEP."}
        </p>
      </div>

      {/* Thống kê (Hiển thị khác nhau tùy Role) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isTeacher ? (
          <>
            <StatCard title="Lớp học" value="4" icon={Users} color="blue" />
            <StatCard title="Bài cần chấm" value="18" icon={FileCheck} color="orange" />
            <StatCard title="Học viên" value="120" icon={Users} color="green" />
            <StatCard title="Điểm trung bình" value="7.5" icon={Activity} color="purple" />
          </>
        ) : (
          <>
            <StatCard title="Tổng User" value="1,540" icon={Users} color="blue" />
            <StatCard title="Đề thi gốc" value="45" icon={BookOpen} color="green" />
            <StatCard title="Truy cập hôm nay" value="320" icon={Activity} color="orange" />
            <StatCard title="Server" value="Stable" icon={SettingsIcon} color="purple" />
          </>
        )}
      </div>

      <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400">
        <p>Khu vực biểu đồ thống kê sẽ được cập nhật sau...</p>
      </div>
    </div>
  );
};

const SettingsIcon = ({className}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
)

export default AdminDashboard;