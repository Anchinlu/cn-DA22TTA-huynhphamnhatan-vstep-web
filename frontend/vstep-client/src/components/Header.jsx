import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Search, Menu, X, User, LogOut,
  LayoutDashboard, School, BookMarked // Icon mới cho Khóa học của tôi
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Chuyển hướng sang trang Khóa học của tôi
  const handleMyCourses = () => {
    navigate('/my-courses');
  };

  useEffect(() => {
    const userData = localStorage.getItem('vstep_user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    localStorage.removeItem('vstep_token');
    localStorage.removeItem('vstep_user');
    setCurrentUser(null);
    setIsDropdownOpen(false);
    window.location.href = '/'; 
  };

  const baseLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Luyện thi', href: '/practice' },
    { name: 'Từ điển', href: '/dictionary' },
  ];

  const managementLinks = [
    { name: 'Lớp học', href: '/class', icon: School },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LOGO */}
          <div className="flex flex-shrink-0 items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 p-1.5 rounded-lg mr-2 shadow-md shadow-blue-200">
               <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 hidden sm:block">
              VSTEP Pro
            </span>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            
            <nav className="flex space-x-1">
              {baseLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                >
                  {item.name}
                </a>
              ))}

              {currentUser && (currentUser.vaiTroId === 2 || currentUser.vaiTroId === 3) && (
                managementLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-all flex items-center gap-1"
                  >
                    {item.name}
                  </a>
                ))
              )}
            </nav>
            
            <div className="h-6 w-px bg-gray-200" />

            {/* === THAY ĐỔI: Nút "Khóa học của tôi" === */}
            {currentUser && currentUser.vaiTroId === 1 && (
               <button 
                  onClick={handleMyCourses}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-sm font-bold transition-all border border-blue-200 shadow-sm hover:shadow"
               >
                  <BookMarked className="w-4 h-4" />
                  Khóa học của tôi
               </button>
            )}

            {/* Search & User Dropdown (Giữ nguyên) */}
            {isSearchOpen ? (
              <div className="relative flex items-center transition-all duration-300 ease-in-out animate-fade-in">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-48 rounded-full border border-gray-300 py-1.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onBlur={() => setIsSearchOpen(false)}
                  autoFocus
                />
                <Search className="absolute right-3 h-4 w-4 text-gray-400" />
              </div>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all">
                <Search className="h-5 w-5" />
              </button>
            )}

            <div className="relative ml-2">
              {currentUser ? (
                <div>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-3 hover:shadow-md transition-all bg-white">
                    <img className="h-8 w-8 rounded-full object-cover border border-gray-100" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.hoTen)}&background=0D8ABC&color=fff`} alt={currentUser.hoTen} />
                    <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">{currentUser.hoTen}</span>
                  </button>

                  {isDropdownOpen && (
                    <div ref={dropdownRef} className="absolute right-0 top-full mt-3 w-64 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none p-2 animate-slide-up z-50">
                      <div className="px-4 py-3 border-b border-gray-100 mb-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{currentUser.hoTen}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        <span className={`mt-2 inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md ${currentUser.vaiTroId === 1 ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {currentUser.vaiTroId === 1 ? 'Học viên' : currentUser.vaiTroId === 2 ? 'Giáo viên' : 'Admin'}
                        </span>
                      </div>
                      
                      {/* Link cá nhân */}
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Thông tin tài khoản</a>
                      {currentUser.vaiTroId === 1 && (
                        <a href="/my-courses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium text-blue-600">
                          Khóa học của tôi
                        </a>
                      )}

                      <div className="h-px bg-gray-100 my-2"></div>
                      <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
                        <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a href="/dang-nhap" className="rounded-full bg-blue-600 text-white px-5 py-2 text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">Đăng nhập</a>
              )}
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Search className="h-6 w-6" /></button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Drawer (Giữ nguyên logic cũ, chỉ cập nhật nút tham gia) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full h-screen z-40">
          <div className="space-y-1 px-4 pt-4 pb-6">
             {/* ... (Giữ nguyên phần map baseLinks) ... */}
             {baseLinks.map((item) => (
              <a key={item.name} href={item.href} className="block rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700">{item.name}</a>
             ))}

             {/* Mobile: Khóa học của tôi */}
             {currentUser && currentUser.vaiTroId === 1 && (
               <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/my-courses'); }}
                  className="w-full text-left block rounded-xl px-4 py-3 text-base font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100"
                >
                  <BookMarked className="w-5 h-5 inline-block mr-2" /> Khóa học của tôi
                </button>
             )}
             {/* ... (Phần User Info & Logout giữ nguyên) ... */}
             <div className="border-t border-gray-100 my-4"></div>
             {currentUser ? (
                <div className="px-4">
                  <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl">
                    <img className="h-12 w-12 rounded-full" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.hoTen)}&background=0D8ABC&color=fff`} alt={currentUser.hoTen} />
                    <div><div className="text-base font-bold text-gray-900">{currentUser.hoTen}</div><div className="text-xs text-gray-500">{currentUser.email}</div></div>
                  </div>
                  <button onClick={handleLogout} className="flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 shadow-sm">
                    <LogOut className="mr-2 h-5 w-5" /> Đăng xuất
                  </button>
                </div>
             ) : (
                <div className="px-4 pt-4"><a href="/dang-nhap" className="block w-full text-center rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white hover:bg-blue-700 shadow-lg">Đăng nhập / Đăng ký</a></div>
             )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;