import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Calendar, LogOut, 
  Trophy, Target, Clock, Activity,
  Headphones, BookOpen, PenTool, Mic,
  History, Award, ChevronRight, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [mockHistory, setMockHistory] = useState([]); // [MỚI] State cho kết quả thi thử
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('vstep_token');
      if (!token) { navigate('/dang-nhap'); return; }

      try {
        // 1. Fetch thông tin Profile & Thống kê lẻ
        const statsRes = await fetch('http://localhost:5000/api/profile/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // 2. [MỚI] Fetch lịch sử thi thử từ bảng ket_qua_thi_thu
        const mockRes = await fetch('http://localhost:5000/api/mock-tests/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsRes.ok) setData(await statsRes.json());
        if (mockRes.ok) setMockHistory(await mockRes.json());

      } catch (err) {
        console.error(err);
        toast.error("Lỗi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('vstep_token');
    localStorage.removeItem('vstep_user');
    toast.success("Đã đăng xuất thành công!");
    navigate('/dang-nhap');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium italic">Đang tải thông tin cá nhân...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Không thể tải dữ liệu hồ sơ.</div>;

  const { user, stats, recent_activity } = data;
  const formatScore = (score) => score ? Number(score).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER PROFILE (Giữ nguyên) */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                {user.ho_ten.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.ho_ten}</h1>
                <div className="flex flex-col sm:flex-row gap-3 mt-2 text-gray-500 text-sm">
                  <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>
                  <span className="flex items-center gap-1"><Calendar size={14}/> Tham gia: {new Date(user.ngay_tao).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="px-6 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold flex items-center gap-2 transition active:scale-95">
              <LogOut size={18}/> Đăng xuất
            </button>
          </div>

          {/* THỐNG KÊ TỔNG QUAN (Giữ nguyên) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Trophy} color="text-yellow-600" bg="bg-yellow-50" label="Điểm trung bình" value={formatScore(stats.overall_avg)} />
            <StatCard icon={Activity} color="text-blue-600" bg="bg-blue-50" label="Tổng bài thi" value={stats.total_tests} />
            <StatCard icon={Clock} color="text-purple-600" bg="bg-purple-50" label="Giờ học tập" value={`${Math.round((stats.total_time || 0) / 60)} phút`} />
            <StatCard icon={Target} color="text-green-600" bg="bg-green-50" label="Mục tiêu" value="B1/B2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              
              {/* PHẦN 1: NĂNG LỰC KỸ NĂNG LẺ (Giữ nguyên) */}
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Target className="text-indigo-500"/> Năng lực từng kỹ năng</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkillCard title="Listening" icon={Headphones} color="blue" score={formatScore(stats.listening_avg)} count={stats.listening_count} />
                  <SkillCard title="Reading" icon={BookOpen} color="emerald" score={formatScore(stats.reading_avg)} count={stats.reading_count} />
                  <SkillCard title="Writing" icon={PenTool} color="indigo" score={formatScore(stats.writing_avg)} count={stats.writing_count} />
                  <SkillCard title="Speaking" icon={Mic} color="orange" score={formatScore(stats.speaking_avg)} count={stats.speaking_count} />
                </div>
              </section>

              {/* [MỚI] PHẦN 2: LỊCH SỬ THI THỬ (FULL 4 KỸ NĂNG) */}
              <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Award className="text-purple-600"/> Lịch sử Mock Test (Full 4 kĩ năng)
                    </h2>
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">{mockHistory.length} bài thi</span>
                </div>
                
                <div className="p-6">
                    {mockHistory.length > 0 ? (
                        <div className="space-y-4">
                            {mockHistory.map((test, idx) => (
                                <div key={test.id} className="group p-5 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex flex-col items-center justify-center border border-purple-100">
                                                <span className="text-xs font-bold leading-none uppercase">Avg</span>
                                                <span className="text-xl font-black">{formatScore(test.overall_score)}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">VSTEP Mock Test #{test.id}</h4>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Calendar size={12}/> {new Date(test.ngay_thi).toLocaleDateString('vi-VN')} 
                                                    <span className="mx-2">•</span> 
                                                    <Clock size={12}/> 120 phút
                                                </p>
                                                
                                                {/* Điểm chi tiết 4 kỹ năng */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-xs font-bold text-gray-600">L: {formatScore(test.listening_score)}</span></div>
                                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-xs font-bold text-gray-600">R: {formatScore(test.reading_score)}</span></div>
                                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-xs font-bold text-gray-600">W: {formatScore(test.writing_score)}</span></div>
                                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span className="text-xs font-bold text-gray-600">S: {formatScore(test.speaking_score)}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center text-center">
                            <ClipboardList size={48} className="text-gray-200 mb-3" />
                            <p className="text-gray-400 text-sm font-medium">Bạn chưa thực hiện bài thi thử Full kỹ năng nào.</p>
                            <button onClick={() => navigate('/mock-tests')} className="mt-4 text-indigo-600 font-bold text-sm hover:underline italic underline-offset-4">Bắt đầu thi ngay →</button>
                        </div>
                    )}
                </div>
              </section>

              {/* BIỂU ĐỒ (Giữ nguyên) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Biểu đồ tiến bộ (Practice)</h3>
                <div className="space-y-4">
                  <ProgressBar label="Listening" score={stats.listening_avg} color="bg-blue-500" />
                  <ProgressBar label="Reading" score={stats.reading_avg} color="bg-emerald-500" />
                  <ProgressBar label="Writing" score={stats.writing_avg} color="bg-indigo-500" />
                  <ProgressBar label="Speaking" score={stats.speaking_avg} color="bg-orange-500" />
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: HOẠT ĐỘNG GẦN ĐÂY (Luyện tập lẻ) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History size={18} className="text-gray-400"/> Luyện tập gần đây
              </h3>
              <div className="space-y-4">
                {recent_activity.length > 0 ? recent_activity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.ky_nang}</p>
                      <p className="text-sm font-bold text-gray-700 line-clamp-1">{item.tieu_de_bai_thi}</p>
                      <p className="text-[10px] text-gray-400">{item.ngay_lam}</p>
                    </div>
                    <div className={`font-black text-lg ${item.diem_so >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                      {item.diem_so}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm text-center py-4 italic">Chưa có bài luyện tập lẻ.</p>
                )}
              </div>
              <button onClick={() => navigate('/practice')} className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-sm">
                Luyện tập thêm
              </button>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Component con (Giữ nguyên)
const StatCard = ({ icon: Icon, color, bg, label, value }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xl font-black text-gray-800 leading-none">{value}</p>
    </div>
  </div>
);

const SkillCard = ({ title, icon: Icon, color, score, count }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  return (
    <div className={`p-5 rounded-2xl border flex flex-col justify-between h-32 transition hover:shadow-md hover:-translate-y-1 ${colorMap[color]}`}>
      <div className="flex justify-between items-start">
        <div className="font-bold text-lg flex items-center gap-2">
          <Icon size={20}/> {title}
        </div>
        <span className="text-[10px] font-bold bg-white/60 px-2 py-1 rounded-md uppercase">{count} bài</span>
      </div>
      <div className="text-4xl font-black">{score}<span className="text-sm font-medium opacity-60">/10</span></div>
    </div>
  );
};

const ProgressBar = ({ label, score, color }) => (
  <div className="group">
    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 group-hover:text-gray-700">
      <span>{label}</span>
      <span>{score ? Number(score).toFixed(1) : 0}/10</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className={`h-2.5 rounded-full transition-all duration-1000 ${color}`} style={{ width: `${(score || 0) * 10}%` }}></div>
    </div>
  </div>
);

export default Profile;