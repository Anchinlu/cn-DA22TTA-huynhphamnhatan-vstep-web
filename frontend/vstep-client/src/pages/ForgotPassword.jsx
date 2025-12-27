import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import { Mail, ArrowLeft, Send } from 'lucide-react';
// [MỚI] Import hàm toast
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Không cần set state message/error nữa, Toast sẽ lo việc hiển thị

    try {
      const res = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // [MỚI] Hiện thông báo thành công đẹp mắt
      toast.success('Đã gửi link! Hãy kiểm tra email của bạn.');
      
    } catch (err) {
      // [MỚI] Hiện thông báo lỗi
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Quên mật khẩu?</h2>
          <p className="text-gray-500 mt-2 text-sm">Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
        </div>

        {/* Đã xóa phần hiển thị message/error cũ (thẻ div xanh/đỏ) vì giờ dùng Toast rồi */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput 
            label="Email đăng ký" 
            icon={Mail} 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="nguoidung@example.com"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Đang gửi...' : <><Send size={18} /> Gửi link khôi phục</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/dang-nhap" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1 transition-colors">
            <ArrowLeft size={16} /> Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;