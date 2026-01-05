import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import toast from 'react-hot-toast';
// [MỚI] Import thư viện Google Login
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const DangNhap = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [mat_khau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Xử lý Đăng nhập Email truyền thống
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

      localStorage.setItem('vstep_token', data.token);
      localStorage.setItem('vstep_user', JSON.stringify(data.user));
      toast.success(`Chào mừng ${data.user.hoTen} quay lại!`);
      navigate('/'); 
    } catch (err) {
      toast.error(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // [MỚI] Xử lý Đăng nhập Google thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    const toastId = toast.loading("Đang xác thực với Google...");
    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('vstep_token', data.token);
        localStorage.setItem('vstep_user', JSON.stringify(data.user));
        toast.success("Đăng nhập Google thành công!", { id: toastId });
        navigate('/');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Xác thực Google thất bại", { id: toastId });
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* CỘT TRÁI: HÌNH ẢNH (Giữ nguyên) */}
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

          {/* [MỚI] Tích hợp Google Login Thật */}
          <div className="mb-6 flex justify-center">
            <GoogleOAuthProvider clientId={clientId}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Đăng nhập Google thất bại")}
                useOneTap
                theme="outline"
                shape="pill"
                width="320px"
                text="signin_with"
              />
            </GoogleOAuthProvider>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider absolute">Hoặc Email</span>
          </div>

          {/* Form Email (Giữ nguyên logic của bạn) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput 
              label="Email" 
              icon={Mail} 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
            <AuthInput 
              label="Mật khẩu" 
              icon={Lock} 
              type="password"
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