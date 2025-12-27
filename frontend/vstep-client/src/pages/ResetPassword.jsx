import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import { Lock, CheckCircle } from 'lucide-react';
// [MỚI] Import toast
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp.');
    }
    
    if (newPassword.length < 6) {
      return toast.error('Mật khẩu quá ngắn (tối thiểu 6 ký tự).');
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Thông báo thành công
      toast.success('Đổi mật khẩu thành công!');
      toast('Đang chuyển về trang đăng nhập...', { icon: '⏳' });
      
      setTimeout(() => navigate('/dang-nhap'), 2000);

    } catch (err) {
      toast.error(err.message || 'Link lỗi hoặc hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput 
            label="Mật khẩu mới" 
            icon={Lock} 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required
          />
          <AuthInput 
            label="Nhập lại mật khẩu" 
            icon={Lock} 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Đang xử lý...' : <><CheckCircle size={18} /> Xác nhận đổi</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;