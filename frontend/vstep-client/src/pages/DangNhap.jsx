import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
// [MỚI] Import toast
import toast from 'react-hot-toast';

// Component Logo Google
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const DangNhap = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [mat_khau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mat_khau }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Có lỗi xảy ra');

      // [MỚI] Lưu token và thông báo thành công
      localStorage.setItem('vstep_token', data.token);
      localStorage.setItem('vstep_user', JSON.stringify(data.user));
      
      toast.success(`Chào mừng ${data.user.hoTen} quay lại!`);
      
      // Chuyển hướng
      setTimeout(() => navigate('/'), 1000); 

    } catch (err) {
      // [MỚI] Thông báo lỗi
      toast.error(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast('Tính năng Đăng nhập Google đang phát triển!', { icon: '🚧' });
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* CỘT TRÁI: HÌNH ẢNH */}
      <div className="hidden lg:block w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974&auto=format&fit=crop" 
          alt="Library" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Chào mừng trở lại!</h1>
          <p className="text-lg text-slate-200 max-w-md">"Học tập không phải là việc làm đầy một cái thùng, mà là thắp sáng một ngọn lửa."</p>
        </div>
      </div>

      {/* CỘT PHẢI: FORM ĐĂNG NHẬP */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-[500px] bg-white p-8 lg:p-10 rounded-3xl shadow-xl border border-slate-100">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-800">Đăng Nhập</h2>
            <p className="text-slate-500 mt-1 text-sm">Truy cập vào tài khoản VSTEP của bạn</p>
          </div>

          {/* Nút Google */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all mb-6 group"
          >
            <GoogleIcon />
            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Đăng nhập với Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider absolute">Hoặc Email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <AuthInput 
              label="Email" 
              icon={Mail} 
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />

            <AuthInput 
              label="Mật khẩu" 
              icon={Lock} 
              type="password"
              name="password"
              autoComplete="current-password"
              value={mat_khau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
            />

            <div className="flex justify-end mb-4">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline font-medium">
                  Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-900/20 
                transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2
                ${loading ? 'bg-slate-400' : 'bg-blue-900 hover:bg-blue-800'}`}
            >
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="font-bold text-blue-700 hover:underline">
              Đăng ký miễn phí
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default DangNhap;