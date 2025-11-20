import React from 'react';
import { BookOpen, Star, Users } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      
      {/* CỘT TRÁI: Ảnh & Thông tin (Ẩn trên mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <img 
          src="/img/reading.jpg" 
          alt="VSTEP Learning" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Luyện thi VSTEP Online</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-md">
            Nền tảng ôn luyện toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết chuẩn quốc gia.
          </p>
          
          {/* Stats nhỏ */}
          <div className="flex gap-8 border-t border-white/20 pt-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5" />
                <span className="text-xl font-bold">1000+</span>
              </div>
              <p className="text-sm text-blue-200">Bài tập</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5" />
                <span className="text-xl font-bold">5000+</span>
              </div>
              <p className="text-sm text-blue-200">Học viên</p>
            </div>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[450px] bg-white p-8 rounded-2xl shadow-xl lg:shadow-none animate-slide-up">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;