import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, School, Users, 
  LogOut, Home, FileText, Zap, Database // Thêm icon Database cho Ngân hàng câu hỏi
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('vstep_user') || '{}');

  // MENU CHO GIÁO VIÊN
  const teacherMenu = [
    { name: 'Bảng điều khiển', path: '/admin', icon: LayoutDashboard },
    { name: 'Lớp học của tôi', path: '/admin/classes', icon: School },
  ];

  // MENU CHO ADMIN
  const adminMenu = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý Người dùng', path: '/admin/users', icon: Users },
    { name: 'Quản lý Lớp học', path: '/admin/classes', icon: School },
    { name: 'Kho đề thi', path: '/admin/create-practice', icon: FileText },
    { name: 'Ngân hàng câu hỏi', path: '/admin/questions', icon: Database },
    { name: 'Đề Thi Thử full tacks', path: '/admin/mock-test', icon: Zap },
  ];

  const menuItems = user.vaiTroId === 3 ? adminMenu : teacherMenu;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <School className="text-green-400 w-6 h-6 mr-2" />
          <span className="font-bold text-lg tracking-wide text-green-400">
            {user.vaiTroId === 3 ? 'ADMIN SYSTEM' : 'TEACHER'}
          </span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 mr-3" />
            <span className="text-sm font-bold">Về trang chủ</span>
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('vstep_token');
              localStorage.removeItem('vstep_user');
              window.location.href = '/';
            }}
            className="w-full flex items-center px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="text-sm font-bold">Đăng xuất</span>
          </button>
        </div>
        
        {/* User Info */}
        <div className="p-4 bg-slate-950/30 flex items-center gap-3">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.vaiTroId === 3 ? 'bg-red-600' : 'bg-indigo-600'}`}>
              {user.hoTen?.charAt(0) || 'U'}
           </div>
           <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.hoTen}</p>
              <p className="text-xs text-slate-400 truncate font-medium">
                {user.vaiTroId === 3 ? 'Quản trị viên (Admin)' : 'Giáo viên'}
              </p>
           </div>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm sticky top-0 z-10">
           <h2 className="text-xl font-bold text-gray-800">
             {menuItems.find(i => i.path === location.pathname)?.name || 'Quản lý'}
           </h2>
           <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> 
              Hệ thống đang hoạt động
           </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;