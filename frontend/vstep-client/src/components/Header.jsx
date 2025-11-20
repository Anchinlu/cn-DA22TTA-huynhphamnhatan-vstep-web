// src/components/Header.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Luyện thi', href: '/practice' },
    { name: 'Từ điển', href: '/dictionary' },
    { name: 'Lớp học', href: '/class' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex flex-shrink-0 items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="ml-2 hidden text-lg font-semibold text-gray-900 lg:block">
              VSTEP Practice Platform
            </span>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <nav className="flex space-x-6">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="h-6 w-px bg-gray-300" />

            {isSearchOpen ? (
              <div className="relative flex items-center transition-all duration-300 ease-in-out">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-48 rounded-full border border-gray-300 py-2 px-4 text-sm"
                  onBlur={() => setIsSearchOpen(false)}
                  autoFocus
                />
                <Search className="absolute right-3 h-5 w-5 text-gray-400" />
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300 ease-in-out"
              >
                <Search className="h-6 w-6" />
              </button>
            )}

            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex rounded-full"
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.hoTen)}&background=0D8ABC&color=fff`}
                      alt={currentUser.hoTen}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div className="py-1">
                        <div className="border-b border-gray-200 px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser.hoTen}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {currentUser.email}
                          </p>
                        </div>
                        <a
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Bảng điều khiển
                        </a>
                        <a
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Thông tin tài khoản
                        </a>
                        <button
                          onClick={handleLogout}
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a 
                  href="/dang-nhap" 
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  title="Đăng nhập"
                >
                  <User className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:hidden">
            <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
              <Search className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 lg:hidden">
          <nav className="space-y-1 px-2 pt-2 pb-3">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                {item.name}
              </a>
            ))}
          </nav>
          <div className="border-t border-gray-200 px-2 pt-4 pb-3">
            {currentUser ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.hoTen)}&background=0D8ABC&color=fff`}
                    alt={currentUser.hoTen}
                  />
                  <span className="text-base font-medium text-gray-800">
                    {currentUser.hoTen}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center rounded-md border border-red-500 bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <a 
                href="/dang-nhap"
                className="flex w-full items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <User className="mr-2 h-5 w-5" />
                Đăng nhập / Đăng ký
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;