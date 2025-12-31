import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, Play, CheckCircle2, Volume2, Mic, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; // Đảm bảo đã import toast

const ExamIntro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load thông tin đề
  useEffect(() => {
    fetch(`http://localhost:5000/api/mock-tests/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Lỗi tải đề");
        return res.json();
      })
      .then(data => setExam(data))
      .catch(() => {
        toast.error("Không tìm thấy đề thi này!");
        navigate('/practice');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStart = () => {
    // 1. Hiện thông báo
    toast.dismiss(); 
    toast.success("Đã vào bài thi!", {
      duration: 3000,
      icon: '🚀',
    });

    // 2. Chuyển trang
    navigate(`/exam/start/${id}`, { replace: true });
  };
  // -------------------

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600 w-10 h-10"/></div>;
  if (!exam) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Cột trái: Thông tin */}
        <div className="bg-indigo-900 text-white p-10 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <button onClick={() => navigate('/practice')} className="flex items-center gap-2 text-indigo-200 hover:text-white mb-8 transition">
                <ArrowLeft size={18}/> Quay lại
            </button>
            <h1 className="text-3xl font-black mb-4 leading-tight">{exam.title}</h1>
            <p className="text-indigo-200 opacity-90">{exam.description || "Đề thi mô phỏng chuẩn cấu trúc VSTEP 4 kỹ năng."}</p>
          </div>
          
          <div className="relative z-10 mt-10 space-y-4">
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Clock className="text-yellow-400 w-6 h-6"/>
                <div>
                    <p className="text-xs text-indigo-200 uppercase font-bold">Tổng thời gian</p>
                    <p className="font-bold">~ 180 phút</p>
                </div>
             </div>
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="text-green-400 w-6 h-6"/>
                <div>
                    <p className="text-xs text-indigo-200 uppercase font-bold">Số kỹ năng</p>
                    <p className="font-bold">4 (Nghe, Nói, Đọc, Viết)</p>
                </div>
             </div>
          </div>

          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Cột phải: Hướng dẫn & Check */}
        <div className="p-10 md:w-3/5 bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quy định phòng thi</h2>
            
            <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">1</span>
                    <span>Bài thi gồm 4 phần thi liên tục. Bạn <strong>không thể tạm dừng</strong> đồng hồ khi đã bắt đầu.</span>
                </li>
                <li className="flex gap-3 text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">2</span>
                    <span>Với phần thi <strong>Listening</strong>, âm thanh sẽ tự động phát và chỉ phát một lần.</span>
                </li>
                <li className="flex gap-3 text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">3</span>
                    <span>Hãy kiểm tra <strong>Loa</strong> và <strong>Microphone</strong> của bạn trước khi bắt đầu.</span>
                </li>
            </ul>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 flex gap-3">
                <AlertTriangle className="text-orange-500 flex-shrink-0"/>
                <div className="text-sm text-orange-800">
                    <span className="font-bold">Lưu ý:</span> Kết quả sẽ được lưu vào lịch sử ngay sau khi bạn bấm "Nộp bài". Hãy đảm bảo kết nối mạng ổn định.
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={() => navigate('/practice')} className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">
                    Để sau
                </button>
                <button 
                    onClick={handleStart}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 transform active:scale-95"
                >
                    BẮT ĐẦU LÀM BÀI <Play size={18} fill="currentColor"/>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ExamIntro;