import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';

const DangNhap = () => {
  const [email, setEmail] = useState('');
  const [mat_khau, setMatKhau] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Logic cũ của bạn: Gọi API đăng nhập
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mat_khau }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Có lỗi xảy ra');

      // Lưu token và chuyển hướng
      localStorage.setItem('vstep_token', data.token);
      localStorage.setItem('vstep_user', JSON.stringify(data.user));
      window.location.href = '/';

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay trở lại!">
      <form onSubmit={handleSubmit}>
        
        <AuthInput 
          label="Email" 
          icon={Mail} 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <div className="flex justify-end mb-6">
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            Quên mật khẩu?
          </a>
        </div>

        {/* Thông báo lỗi chung */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-lg text-white font-bold text-lg shadow-md transition-all duration-300
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg'
            }
          `}
        >
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>

        <p className="mt-8 text-center text-sm text-gray-600">
          Bạn chưa có tài khoản?{' '}
          <a href="/dang-ky" className="font-bold text-primary hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default DangNhap;