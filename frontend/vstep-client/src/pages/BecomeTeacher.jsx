import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Upload, CheckCircle2, ArrowLeft, Phone, Link as LinkIcon, BookOpen, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
// [MỚI] Import toast
import toast from 'react-hot-toast';

const BecomeTeacher = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    so_dien_thoai: '',
    trinh_do: '',
    kinh_nghiem: '',
    link_cv: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    const token = localStorage.getItem('vstep_token');
    
    // [MỚI] Kiểm tra đăng nhập và thông báo
    if (!token) { 
        toast.error("Vui lòng đăng nhập để gửi hồ sơ!");
        navigate('/dang-nhap'); // [SỬA] Sửa route từ /login thành /dang-nhap
        return; 
    }

    try {
      const res = await fetch('http://localhost:5000/api/teacher-request', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        toast.success("Gửi hồ sơ thành công!"); // [MỚI] Thông báo thành công
      } else {
        // [MỚI] Thay alert bằng toast error
        toast.error(data.message || "Có lỗi xảy ra khi gửi hồ sơ.");
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối đến máy chủ.");
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-green-100 animate-fade-in-up">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã gửi hồ sơ!</h2>
                <p className="text-gray-500 mb-8 text-sm">
                    Yêu cầu của bạn đang được xét duyệt. Chúng tôi sẽ phản hồi sớm nhất qua email.
                </p>
                <button onClick={() => navigate('/')} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition">Về trang chủ</button>
            </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12 pt-28">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
            
            {/* CỘT TRÁI: GIỚI THIỆU (Màu Xanh) */}
            <div className="md:w-1/3 bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <button onClick={() => navigate(-1)} className="text-emerald-100 hover:text-white flex items-center gap-2 text-sm font-bold mb-8 transition">
                        <ArrowLeft size={16}/> Quay lại
                    </button>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                        <GraduationCap className="w-8 h-8 text-emerald-100"/>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 leading-tight">Trở thành Đối tác Giáo dục</h1>
                    <p className="text-emerald-100 text-sm opacity-90 leading-relaxed">
                        Tham gia đội ngũ giảng viên VSTEP Master để chia sẻ kiến thức và tạo thu nhập từ các lớp học của bạn.
                    </p>
                </div>
                
                {/* Decor Circles */}
                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-teal-500/20 rounded-full blur-xl"></div>
                
                <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
                    <p className="text-xs text-emerald-200 font-medium">✨ Quyền lợi đặc biệt:</p>
                    <ul className="text-xs text-emerald-50 mt-2 space-y-1 opacity-80">
                        <li>• Tạo lớp học không giới hạn</li>
                        <li>• Hệ thống chấm điểm tự động</li>
                        <li>• Quản lý học viên dễ dàng</li>
                    </ul>
                </div>
            </div>
            
            {/* CỘT PHẢI: FORM NHẬP LIỆU (Trắng) */}
            <div className="md:w-2/3 p-8 lg:p-10">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin đăng ký</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Hàng 1: SĐT & Trình độ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Số điện thoại</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    type="text" required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm font-medium text-gray-700 bg-gray-50 focus:bg-white"
                                    placeholder="0912345678"
                                    value={formData.so_dien_thoai}
                                    onChange={e => setFormData({...formData, so_dien_thoai: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trình độ / Bằng cấp</label>
                            <div className="relative">
                                <BookOpen size={18} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    type="text" required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm font-medium text-gray-700 bg-gray-50 focus:bg-white"
                                    placeholder="VD: IELTS 8.0, VSTEP C1..."
                                    value={formData.trinh_do}
                                    onChange={e => setFormData({...formData, trinh_do: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hàng 2: Link CV */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Link CV / Portfolio</label>
                        <div className="relative">
                            <LinkIcon size={18} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="url" required
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm font-medium text-gray-700 bg-gray-50 focus:bg-white"
                                placeholder="https://drive.google.com/..."
                                value={formData.link_cv}
                                onChange={e => setFormData({...formData, link_cv: e.target.value})}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1"><AlertCircle size={10}/> Link cần được chia sẻ quyền truy cập công khai (Public).</p>
                    </div>

                    {/* Hàng 3: Kinh nghiệm */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kinh nghiệm giảng dạy</label>
                        <textarea 
                            required rows="3"
                            className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm font-medium text-gray-700 bg-gray-50 focus:bg-white resize-none"
                            placeholder="Mô tả ngắn gọn kinh nghiệm của bạn (VD: 3 năm dạy tại trung tâm XYZ...)"
                            value={formData.kinh_nghiem}
                            onChange={e => setFormData({...formData, kinh_nghiem: e.target.value})}
                        ></textarea>
                    </div>

                    {/* Nút Submit */}
                    <button 
                        type="submit" 
                        disabled={status === 'loading'}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                    >
                        {status === 'loading' ? (
                            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang xử lý...</>
                        ) : (
                            <><Upload size={20}/> Gửi hồ sơ đăng ký</>
                        )}
                    </button>

                </form>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeTeacher;