import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Calendar, LogOut, 
  Trophy, Target, Clock, Activity,
  Headphones, BookOpen, PenTool, Mic,
  History, Award, ChevronRight, ClipboardList, Settings2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [mockHistory, setMockHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- GIỮ NGUYÊN LOGIC FETCH DỮ LIỆU ---
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('vstep_token');
      if (!token) { navigate('/dang-nhap'); return; }
      try {
        const statsRes = await fetch('http://localhost:5000/api/profile/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Đang tải hồ sơ...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-rose-500 font-bold">Không thể tải dữ liệu hồ sơ.</div>;

  const { user, stats, recent_activity } = data;
  const formatScore = (score) => score ? Number(score).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* 1. HEADER PROFILE - Tối giản, chuyên nghiệp */}
          <div className="border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-3xl font-black border border-slate-200">
                {user.ho_ten.charAt(0).toUpperCase()}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{user.ho_ten}</h1>
                <div className="flex flex-col sm:flex-row gap-4 mt-1 text-slate-400 font-medium text-xs">
                  <span className="flex items-center gap-1.5"><Mail size={14}/> {user.email}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14}/> Tham gia: {new Date(user.ngay_tao).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2 border border-slate-200 rounded text-xs font-black uppercase text-slate-500 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-all">
              <LogOut size={14}/> Đăng xuất
            </button>
          </div>

          {/* 2. THỐNG KÊ TỔNG QUAN - Grid vuông vức */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Trophy} label="GPA Trung bình" value={formatScore(stats.overall_avg)} />
            <StatCard icon={Activity} label="Tổng bài thi" value={stats.total_tests} />
            <StatCard icon={Clock} label="Phút học tập" value={Math.round((stats.total_time || 0) / 60)} />
            <StatCard icon={Target} label="Trình độ" value="B1/B2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* CỘT TRÁI (8/12): CHÍNH */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* NĂNG LỰC KỸ NĂNG LẺ - Nơi tập trung màu sắc */}
              <section className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Settings2 size={14}/> Thống kê năng lực thực tế
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkillCard title="Listening" icon={Headphones} color="blue" score={formatScore(stats.listening_avg)} count={stats.listening_count} />
                  <SkillCard title="Reading" icon={BookOpen} color="emerald" score={formatScore(stats.reading_avg)} count={stats.reading_count} />
                  <SkillCard title="Writing" icon={PenTool} color="indigo" score={formatScore(stats.writing_avg)} count={stats.writing_count} />
                  <SkillCard title="Speaking" icon={Mic} color="orange" score={formatScore(stats.speaking_avg)} count={stats.speaking_count} />
                </div>
              </section>

              {/* LỊCH SỬ THI THỬ (FULL 4 KỸ NĂNG) - Tối giản dạng Table row */}
              <section className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Award size={16}/> Lịch sử Mock Test (Full Skills)
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded uppercase tracking-tighter">{mockHistory.length} bài</span>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {mockHistory.length > 0 ? mockHistory.map((test) => (
                        <div key={test.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-white border border-slate-200 rounded flex flex-col items-center justify-center">
                                    <span className="text-[9px] font-black text-slate-400 leading-none">AVG</span>
                                    <span className="text-base font-black text-slate-900">{formatScore(test.overall_score)}</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">VSTEP Mock Test #{test.id}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-3 mt-0.5">
                                        <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(test.ngay_thi).toLocaleDateString('vi-VN')}</span>
                                        <span className="flex items-center gap-1"><Clock size={10}/> 120'</span>
                                    </p>
                                </div>
                            </div>
                            
                            {/* Điểm nhỏ 4 kỹ năng */}
                            <div className="hidden sm:flex items-center gap-3 mr-4">
                                <MiniScore color="bg-blue-500" val={formatScore(test.listening_score)} />
                                <MiniScore color="bg-emerald-500" val={formatScore(test.reading_score)} />
                                <MiniScore color="bg-indigo-500" val={formatScore(test.writing_score)} />
                                <MiniScore color="bg-orange-500" val={formatScore(test.speaking_score)} />
                            </div>

                            <button onClick={() => navigate(`/mock-test/result/${test.id}`)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <ClipboardList size={40} className="text-slate-100 mb-2" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chưa có bài thi nào</p>
                            <button onClick={() => navigate('/mock-tests')} className="mt-2 text-indigo-600 text-xs font-black uppercase hover:underline">Thi ngay →</button>
                        </div>
                    )}
                </div>
              </section>

              {/* BIỂU ĐỒ TIẾN BỘ */}
              <div className="border border-slate-200 rounded-lg p-6 space-y-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14}/> Phân tích tiến độ học tập
                </h3>
                <div className="space-y-5">
                  <ProgressBar label="Listening" score={stats.listening_avg} color="bg-blue-500" />
                  <ProgressBar label="Reading" score={stats.reading_avg} color="bg-emerald-500" />
                  <ProgressBar label="Writing" score={stats.writing_avg} color="bg-indigo-500" />
                  <ProgressBar label="Speaking" score={stats.speaking_avg} color="bg-orange-500" />
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (4/12): HOẠT ĐỘNG GẦN ĐÂY */}
            <div className="lg:col-span-4">
                <div className="border border-slate-200 rounded-lg p-5 sticky top-24 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History size={16}/> Luyện tập gần đây
                    </h3>
                    <div className="space-y-1">
                        {recent_activity.length > 0 ? recent_activity.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded transition-colors group">
                            <div className="min-w-0">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter group-hover:text-slate-500 transition-colors">{item.ky_nang}</p>
                                <p className="text-xs font-bold text-slate-700 truncate pr-2">{item.tieu_de_bai_thi}</p>
                                <p className="text-[9px] text-slate-400 font-mono">{item.ngay_lam}</p>
                            </div>
                            <div className={`font-black text-sm w-10 text-right ${item.diem_so >= 5 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {item.diem_so}
                            </div>
                        </div>
                        )) : (
                            <p className="text-slate-300 text-[10px] font-bold text-center py-10 uppercase tracking-widest">Trống</p>
                        )}
                    </div>
                    <button onClick={() => navigate('/practice')} className="w-full mt-4 py-2.5 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded hover:bg-slate-800 transition-all shadow-sm">
                        Khám phá bài tập mới
                    </button>
                </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// --- CÁC COMPONENT CON TINH CHỈNH ---

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-4 border border-slate-200 rounded flex flex-col justify-center items-center text-center transition-all hover:border-slate-400">
    <Icon size={18} className="text-slate-300 mb-2" />
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
    <p className="text-lg font-black text-slate-900 leading-none">{value}</p>
  </div>
);

const MiniScore = ({ color, val }) => (
    <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
        <span className="text-[10px] font-black text-slate-600">{val}</span>
    </div>
);

const SkillCard = ({ title, icon: Icon, color, score, count }) => {
  const colorMap = {
    blue: 'border-blue-200 text-blue-600 bg-blue-50/30',
    emerald: 'border-emerald-200 text-emerald-600 bg-emerald-50/30',
    indigo: 'border-indigo-200 text-indigo-600 bg-indigo-50/30',
    orange: 'border-orange-200 text-orange-600 bg-orange-50/30'
  };

  return (
    <div className={`p-4 rounded border flex flex-col justify-between h-28 transition-all hover:shadow-sm ${colorMap[color]}`}>
      <div className="flex justify-between items-start">
        <div className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
          <Icon size={16} strokeWidth={2.5}/> {title}
        </div>
        <span className="text-[9px] font-black bg-white border border-inherit px-1.5 py-0.5 rounded tracking-tighter uppercase">{count} tests</span>
      </div>
      <div className="text-3xl font-black tabular-nums">{score}<span className="text-xs font-medium opacity-50 ml-0.5">/10</span></div>
    </div>
  );
};

const ProgressBar = ({ label, score, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
      <span>{label}</span>
      <span className="text-slate-900">{score ? Number(score).toFixed(1) : 0}/10</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${(score || 0) * 10}%` }}></div>
    </div>
  </div>
);

export default Profile;