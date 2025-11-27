import React, { useState } from 'react';
import { 
  School, ArrowRight, QrCode, Hash, 
  CheckCircle, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const JoinClass = () => {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Giả lập gọi API kiểm tra mã lớp
    setTimeout(() => {
      if (classCode.length < 5) {
        setError("Mã lớp học không hợp lệ (ít nhất 5 ký tự).");
        setLoading(false);
      } else {
        // Thành công (Giả định)
        alert(`Đã gửi yêu cầu tham gia lớp: ${classCode}`);
        setLoading(false);
        // navigate('/class/detail'); // Sau này sẽ chuyển hướng
      }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Header />

      <main className="flex-grow pt-24 pb-20 px-4 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
            <div className="absolute top-20 left-[-100px] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-[-100px] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-100px] left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
              <School className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Tham gia lớp học</h1>
            <p className="text-slate-500">Nhập mã lớp do giáo viên cung cấp để bắt đầu.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-slate-100 p-8">
            <form onSubmit={handleJoin} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Mã lớp học
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase tracking-wider"
                    placeholder="VD: ENG101"
                    value={classCode}
                    onChange={(e) => {
                      setClassCode(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    autoFocus
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-red-500 text-sm font-medium animate-fade-in">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !classCode}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-200 
                  flex items-center justify-center gap-2 transition-all duration-300
                  ${loading || !classCode 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl'}
                `}
              >
                {loading ? 'Đang tìm lớp...' : 'Vào lớp ngay'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium">Hoặc</span>
              </div>
            </div>

            <button 
              onClick={() => alert('Tính năng quét QR đang phát triển!')}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all group"
            >
              <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Quét mã QR
            </button>

          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Bạn gặp khó khăn? <a href="#" className="text-blue-600 font-bold hover:underline">Xem hướng dẫn</a>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JoinClass;