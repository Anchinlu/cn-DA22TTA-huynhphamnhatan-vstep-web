import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginMascot = () => (
  <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative p-12">
    {/* Animated Circles */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute h-96 w-96 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 opacity-20 animate-pulse-slow" />
      <div className="absolute h-80 w-80 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="relative h-64 w-64 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl">
        <Lock className="w-24 h-24 text-white" />
      </div>
    </div>
    
    <div className="relative z-10 text-center mt-[30rem]">
      <h2 className="text-3xl font-bold text-gray-800">Chào mừng trở lại!</h2>
      <p className="mt-4 text-lg text-gray-600">
        Đăng nhập để tiếp tục hành trình chinh phục VSTEP của bạn.
      </p>
    </div>
  </div>
);



const DangNhap = () => {
  const [email, setEmail] = useState('');
  const [mat_khau, setMatKhau] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mat_khau }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      // Đăng nhập thành công
      setSuccess('Đăng nhập thành công! Đang chuyển về trang chủ...');
      localStorage.setItem('vstep_token', data.token);
      localStorage.setItem('vstep_user', JSON.stringify(data.user));

      setTimeout(() => {
        window.location.href = '/'; 
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 animate-fade-in">
      <div className="flex w-full max-w-6xl overflow-hidden">
        
        <LoginMascot />
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div 
            className="w-full max-w-md transform rounded-3xl bg-white p-8 shadow-2xl transition-all duration-500 hover:shadow-3xl md:p-10 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-800">Đăng Nhập</h1>
              <p className="mt-2 text-gray-500">Truy cập vào tài khoản của bạn</p>
            </div>


            <form className="space-y-6" onSubmit={handleSubmit}>
              
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Email / Tên đăng nhập
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail 
                      className={`h-5 w-5 transition-colors duration-300 ${isEmailFocused ? 'text-blue-500' : 'text-gray-400'}`} 
                    />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-gray-900 shadow-sm transition duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
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
                    <Lock 
                      className={`h-5 w-5 transition-colors duration-300 ${isPasswordFocused ? 'text-blue-500' : 'text-gray-400'}`} 
                    />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-10 text-gray-900 shadow-sm transition duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••••••"
                    value={mat_khau}
                    onChange={(e) => setMatKhau(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 hover:text-gray-900 cursor-pointer">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                    Quên mật khẩu?
                  </a>
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
                  className={`flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
                             py-3 px-4 text-base font-bold text-white shadow-lg transition-all 
                             duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] 
                             active:scale-[0.98] 
                             ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </div>
            </form>

            {/* Register Link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <a href="/dang-ky" className="font-bold text-blue-600 hover:text-blue-700">
                Đăng ký ngay
              </a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DangNhap;