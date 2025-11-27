import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, Headphones, Mic, PenTool, // Icon kỹ năng
  Users, LogOut, Settings, Shield,    // Icon hệ thống
  School, FileCheck, MessageSquare, Database // Icon giáo dục
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy Role ID
  const userStr = localStorage.getItem('vstep_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const roleId = user?.vaiTroId; 

  // --- MENU CHO ADMIN (ID 3) ---
  // Tập trung: Quản trị hệ thống, Người dùng, Kho đề nguồn
  const adminMenu = [
    { name: 'Tổng quan', icon: LayoutDashboard, path: '/admin' },
    { name: 'Quản lý Người dùng', icon: Users, path: '/admin/users' },
    { name: 'Kho đề Reading', icon: BookOpen, path: '/admin/reading' },
    { name: 'Kho đề Listening', icon: Headphones, path: '/admin/listening' },
    { name: 'Kho đề Writing', icon: PenTool, path: '/admin/writing' },
    { name: 'Kho đề Speaking', icon: Mic, path: '/admin/speaking' },
    { name: 'Cấu hình', icon: Settings, path: '/admin/settings' },
  ];

  // --- MENU CHO GIÁO VIÊN (ID 2) ---
  // Tập trung: Lớp học, Chấm bài, Feedback
  const teacherMenu = [
    { name: 'Bảng điều khiển', icon: LayoutDashboard, path: '/admin' },
    { name: 'Lớp học của tôi', icon: School, path: '/admin/classes' },
    { name: 'Giao bài tập', icon: Database, path: '/admin/assignments' },
    { name: 'Chấm bài & Feedback', icon: FileCheck, path: '/admin/grading' },
    { name: 'Hỗ trợ học viên', icon: MessageSquare, path: '/admin/support' },
  ];

  // 2. Quyết định hiển thị Menu nào
  const menuItems = roleId === 3 ? adminMenu : teacherMenu;

  const handleLogout = () => {
    localStorage.removeItem('vstep_token');
    localStorage.removeItem('vstep_user');
    window.location.href = '/dang-nhap';
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* --- SIDEBAR BÊN TRÁI --- */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        
        {/* Logo & Tên vai trò */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-lg tracking-wide">
          {roleId === 3 ? (
            <div className="flex items-center text-red-400">
              <Shield className="w-6 h-6 mr-2" /> ADMIN
            </div>
          ) : (
            <div className="flex items-center text-green-400">
              <School className="w-6 h-6 mr-2" /> TEACHER
            </div>
          )}
        </div>

        {/* Danh sách Menu (Dynamic) */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-1
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}
                  `}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Thông tin User nhỏ ở dưới cùng */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold shadow-lg">
              {user?.hoTen?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.hoTen}</p>
              <p className="text-xs text-slate-400">
                {roleId === 3 ? 'Administrator' : 'Giáo viên'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all duration-300"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </div>

      {/* --- NỘI DUNG CHÍNH (BÊN PHẢI) --- */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Header nhỏ của trang Admin */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-gray-800">
            {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h2>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Hệ thống đang hoạt động
          </div>
        </header>

        {/* Nơi hiển thị nội dung các trang con */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet /> 
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;