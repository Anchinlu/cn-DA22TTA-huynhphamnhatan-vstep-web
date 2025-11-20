import React, { useState } from 'react';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';

const DangKy = () => {
  const [formData, setFormData] = useState({
    ho_ten: '', email: '', mat_khau: '', confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hàm kiểm tra độ mạnh mật khẩu (chỉ để hiển thị UI cho đẹp)
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; 
  };
  const strength = getPasswordStrength(formData.mat_khau);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.mat_khau !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    try {
      // Logic cũ: Gọi API đăng ký
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
    <AuthLayout title="Tạo tài khoản" subtitle="Bắt đầu hành trình chinh phục VSTEP">
      <form onSubmit={handleSubmit}>
        
        <AuthInput 
          label="Họ và tên" icon={User} name="ho_ten"
          value={formData.ho_ten} onChange={handleChange} required
        />

        <AuthInput 
          label="Email" icon={Mail} type="email" name="email"
          value={formData.email} onChange={handleChange} required
        />

        <div className="mb-2">
          <AuthInput 
            label="Mật khẩu" icon={Lock} type="password" name="mat_khau"
            value={formData.mat_khau} onChange={handleChange} required
          />
          {/* Thanh độ mạnh mật khẩu (UI Only) */}
          {formData.mat_khau && (
            <div className="flex gap-1 h-1 mt-[-10px] mb-4 px-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`flex-1 rounded-full transition-colors duration-300 
                  ${i <= strength ? (strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`} 
                />
              ))}
            </div>
          )}
        </div>

        <AuthInput 
          label="Xác nhận mật khẩu" icon={CheckCircle} type="password" name="confirmPassword"
          value={formData.confirmPassword} onChange={handleChange} required
          error={formData.confirmPassword && formData.mat_khau !== formData.confirmPassword ? "Mật khẩu không khớp" : null}
        />

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded text-center">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded text-center">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-lg text-white font-bold text-lg shadow-md transition-all duration-300
            ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark hover:-translate-y-0.5'}
          `}
        >
          {loading ? 'Đang xử lý...' : 'Đăng Ký'}
        </button>

        <p className="mt-8 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <a href="/dang-nhap" className="font-bold text-primary hover:underline">
            Đăng nhập ngay
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default DangKy;