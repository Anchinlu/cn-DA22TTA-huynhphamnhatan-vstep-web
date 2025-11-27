import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthInput from '../components/AuthInput';

// Component Logo Google
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const DangKy = () => {
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    mat_khau: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate
    if (!formData.ho_ten || !formData.email || !formData.mat_khau) {
        setError('Vui lòng điền đầy đủ thông tin.');
        setLoading(false);
        return;
    }
    if (formData.mat_khau !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ho_ten: formData.ho_ten, 
          email: formData.email, 
          mat_khau: formData.mat_khau 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => { window.location.href = '/dang-nhap'; }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* CỘT TRÁI */}
      <div className="hidden lg:block w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop" 
          alt="Library" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Bắt đầu hành trình VSTEP</h1>
          <p className="text-lg text-slate-200 max-w-md">"Học tập là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc."</p>
        </div>
      </div>

      {/* CỘT PHẢI: FORM ĐĂNG KÝ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-[500px] bg-white p-8 lg:p-10 rounded-3xl shadow-xl border border-slate-100">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-800">Tạo tài khoản</h2>
            <p className="text-slate-500 mt-1 text-sm">Miễn phí trọn đời cho học viên mới</p>
          </div>

          {/* Nút Google */}
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all mb-6 group">
            <GoogleIcon />
            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Đăng ký với Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider absolute">Hoặc Email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Họ tên (Đã chuyển về full width) */}
            <AuthInput 
              label="Họ và tên" 
              icon={User} 
              name="ho_ten" 
              value={formData.ho_ten} 
              onChange={handleChange} 
              placeholder="Nguyễn Văn A"
              required 
            />

            {/* Email */}
            <AuthInput 
              label="Email" 
              icon={Mail} 
              type="email"
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="email@example.com"
              required 
            />

            {/* Mật khẩu & Xác nhận (Giữ 2 cột cho gọn) */}
            <div className="grid grid-cols-2 gap-4">
              <AuthInput 
                label="Mật khẩu" 
                icon={Lock} 
                type="password"
                name="mat_khau" 
                value={formData.mat_khau} 
                onChange={handleChange} 
                required 
              />
              <AuthInput 
                label="Xác nhận" 
                icon={Lock} 
                type="password"
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}
            {success && <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-lg">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-900/20 
                transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2
                ${loading ? 'bg-slate-400' : 'bg-blue-900 hover:bg-blue-800'}`}
            >
              {loading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="font-bold text-blue-700 hover:underline">
              Đăng nhập
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default DangKy;