import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, User, Phone, UserPlus } from 'lucide-react';

const RegisterMascot = () => (
  <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative p-12">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute h-96 w-96 rounded-full bg-gradient-to-br from-green-300 to-blue-400 opacity-20 animate-pulse-slow" />
      <div className="absolute h-80 w-80 rounded-full bg-gradient-to-br from-green-400 to-blue-500 opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="relative h-64 w-64 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-2xl">
        <UserPlus className="w-24 h-24 text-white" />
      </div>
    </div>
    
    <div className="relative z-10 text-center mt-[30rem]">
      <h2 className="text-3xl font-bold text-gray-800">Tham gia cùng chúng tôi!</h2>
      <p className="mt-4 text-lg text-gray-600">
        Tạo tài khoản để bắt đầu luyện tập và theo dõi tiến độ của bạn.
      </p>
    </div>
  </div>
);


const DangKy = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    phone: '',
    mat_khau: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 1. Validation 
    if (formData.mat_khau !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    try {
      // 2. Gọi API ( backend chỉ lấy ho_ten, email, mat_khau)
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ho_ten: formData.ho_ten, 
          email: formData.email, 
          mat_khau: formData.mat_khau 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      // === Đăng ký thành công ===
      setSuccess("Tạo tài khoản thành công! Đang chuyển bạn đến trang đăng nhập...");
      
      setTimeout(() => {
        window.location.href = '/dang-nhap';
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 animate-fade-in">
      <div className="flex w-full max-w-6xl overflow-hidden">
        
        {/* === 2.1 Mascot Section (Trái) === */}
        <RegisterMascot />

        {/* === 2.2 Form Section (Phải) === */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div 
            className="w-full max-w-md transform rounded-3xl bg-white p-8 shadow-2xl transition-all duration-500 hover:shadow-3xl md:p-10 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Form Header */}
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-800">Đăng Ký</h1>
              <p className="mt-2 text-gray-500">Tạo tài khoản mới của bạn</p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Full Name Input */}
              <div>
                <label 
                  htmlFor="ho_ten" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Họ và tên
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="ho_ten"
                    name="ho_ten"
                    type="text"
                    autoComplete="name"
                    required
                    className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-gray-900 shadow-sm transition duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ và tên đầy đủ"
                    value={formData.ho_ten}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-gray-900 shadow-sm transition duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label 
                  htmlFor="phone" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Số điện thoại
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-gray-900 shadow-sm transition duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại (Không bắt buộc)"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="password"
                    name="mat_khau"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-10 text-gray-900 shadow-sm transition duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••••••"
                    value={formData.mat_khau}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-10 text-gray-900 shadow-sm transition duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Thông báo Lỗi / Thành công  */}
              {error && (
                <div className="text-center text-sm font-medium text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-center text-sm font-medium text-green-600">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex w-full justify-center rounded-xl bg-gradient-to-r from-green-500 to-blue-600 
                             py-3 px-4 text-base font-bold text-white shadow-lg transition-all 
                             duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] 
                             active:scale-[0.98] 
                             ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <a href="/dang-nhap" className="font-bold text-blue-600 hover:text-blue-700">
                Đăng nhập
              </a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DangKy;