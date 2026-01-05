import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, Star, ArrowRight, Home, RefreshCw, 
  CheckCircle2, AlertCircle, MessageSquare, ShieldCheck,
  TrendingUp, BarChart3,PenTool, Mic
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/Header';

const MockTestResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('vstep_token');
        const res = await fetch(`http://localhost:5000/api/mock-test/result/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setResult(data);
        else toast.error("Không tìm thấy kết quả thi");
      } catch (err) {
        toast.error("Lỗi kết nối hệ thống");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  // Logic tính điểm trung bình và quy đổi bậc
  const calculateLevel = (avg) => {
    if (avg >= 8.5) return { level: 'Bậc 5 (C1)', color: 'text-rose-600', bg: 'bg-rose-50' };
    if (avg >= 6.0) return { level: 'Bậc 4 (B2)', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (avg >= 4.0) return { level: 'Bậc 3 (B1)', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    return { level: 'Chưa đạt bậc', color: 'text-slate-500', bg: 'bg-slate-50' };
  };

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse text-indigo-600 font-bold">Đang tổng hợp kết quả...</div>;
  if (!result) return <div className="text-center p-20">Dữ liệu không tồn tại.</div>;

  const avgScore = ((result.reading_score + result.listening_score + result.writing_score + result.speaking_score) / 4).toFixed(1);
  const vstepInfo = calculateLevel(parseFloat(avgScore));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      
      <main className="max-w-5xl mx-auto pt-28 px-4">
        {/* 1. Hero Header: Tổng quan điểm số */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-indigo-100/50 border border-indigo-50 mb-8 relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="inline-flex p-4 bg-yellow-50 rounded-full mb-6 text-yellow-500">
            <Trophy size={48} />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 mb-2">Hoàn thành Bài thi thử!</h1>
          <p className="text-slate-500 mb-8">Hệ thống đã phân tích xong năng lực ngôn ngữ của bạn.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-2xl mx-auto">
            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Điểm trung bình (GPA)</span>
              <div className="text-6xl font-black mt-2">{avgScore}</div>
              <div className="mt-4 flex items-center justify-center gap-2 text-yellow-400">
                <Star size={16} fill="currentColor" />
                <span className="text-sm font-bold">Thang điểm VSTEP 10</span>
              </div>
            </div>

            <div className={`p-8 rounded-[2.5rem] border-4 border-dashed border-white flex flex-col items-center justify-center ${vstepInfo.bg}`}>
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Trình độ tương đương</span>
               <div className={`text-3xl font-black mt-2 ${vstepInfo.color}`}>{vstepInfo.level}</div>
               <TrendingUp size={32} className={`mt-4 ${vstepInfo.color}`} />
            </div>
          </div>
        </div>

        {/* 2. Skill Cards: Chi tiết 4 kỹ năng */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Reading', score: result.reading_score, color: 'emerald' },
            { label: 'Listening', score: result.listening_score, color: 'blue' },
            { label: 'Writing', score: result.writing_score, color: 'violet' },
            { label: 'Speaking', score: result.speaking_score, color: 'orange' },
          ].map((s) => (
            <div key={s.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</span>
              <div className={`text-4xl font-black text-${s.color}-600`}>{s.score}</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className={`h-full bg-${s.color}-500`} style={{ width: `${s.score * 10}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. AI Insights Section */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-3 ml-4">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Phân tích chuyên sâu từ AI</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="flex items-center gap-2 font-black text-slate-800 mb-4">
                <PenTool className="text-violet-500" /> Writing Analysis
              </h3>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line italic">
                "{result.writing_feedback || "AI đang tổng hợp nhận xét..."}"
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="flex items-center gap-2 font-black text-slate-800 mb-4">
                <Mic className="text-orange-500" /> Speaking Analysis
              </h3>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line italic">
                "{result.speaking_feedback || "AI đang tổng hợp nhận xét..."}"
              </div>
            </div>
          </div>
        </div>

        {/* 4. Disclaimer & Actions */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 mb-8 flex items-start gap-4">
          <AlertCircle className="text-indigo-600 shrink-0 mt-1" />
          <p className="text-sm text-indigo-900 leading-relaxed font-medium">
            <span className="font-bold">Lưu ý quan trọng:</span> Kết quả này được phân tích bởi Trợ lý AI dựa trên các tiêu chí chấm điểm VSTEP (B1-C1). 
            Điểm số này chỉ mang giá trị <span className="underline decoration-wavy">tham khảo</span> giúp bạn định hướng lộ trình học tập, 
            không có giá trị thay thế cho chứng chỉ chính thức từ các đơn vị tổ chức thi của Bộ GD&ĐT.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/mock-test')} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95">
            <RefreshCw size={20} /> Thử sức lại lần nữa
          </button>
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all active:scale-95">
            <Home size={20} /> Quay về Trang cá nhân
          </button>
        </div>
      </main>
    </div>
  );
};

export default MockTestResult;