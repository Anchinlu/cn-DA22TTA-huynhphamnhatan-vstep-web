import React from 'react';
import { GraduationCap, BookOpen, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      
      {/* CỘT TRÁI: Hình ảnh & Cảm hứng (Học thuật) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-900">
        {/* Ảnh nền Thư viện/Học tập */}
        <img 
          src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974&auto=format&fit=crop" 
          alt="Library" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        
        {/* Overlay Gradient tạo chiều sâu */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-900/60 to-slate-900/90" />
        
        {/* Nội dung trên ảnh */}
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-fit"
          >
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold tracking-wide">VSTEP Pro</span>
          </div>

          <div className="space-y-8">
            <blockquote className="text-2xl font-light italic leading-relaxed opacity-90 border-l-4 border-blue-400 pl-6">
              "Học tập không phải là việc làm đầy một cái thùng, mà là thắp sáng một ngọn lửa."
            </blockquote>
            
            <div className="flex gap-8 pt-8 border-t border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1 text-blue-300">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-semibold">1000+</span>
                </div>
                <p className="text-sm text-slate-300">Bài luyện tập</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 text-yellow-400">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">B1 - C1</span>
                </div>
                <p className="text-sm text-slate-300">Chứng chỉ chuẩn</p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-400">© 2025 VSTEP Practice Platform. All rights reserved.</p>
        </div>
      </div>

      {/* CỘT PHẢI: Form nhập liệu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-[480px]">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{title}</h1>
            <p className="text-slate-500 text-lg">{subtitle}</p>
          </div>
          
          {/* Children là nơi chứa Form Đăng nhập/Đăng ký */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;