import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Calendar, LogOut, 
  Trophy, Target, Clock, Activity,
  Headphones, BookOpen, PenTool, Mic,
  History // <--- Đã thêm icon này vào import
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Profile = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('vstep_token');
      if (!token) { navigate('/login'); return; }

      try {
        const res = await fetch('http://localhost:5000/api/profile/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('vstep_token');
    localStorage.removeItem('vstep_user');
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải hồ sơ...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Không thể tải dữ liệu.</div>;

  const { user, stats, recent_activity } = data;

  // Helper để hiển thị điểm số (làm tròn 1 số thập phân)
  const formatScore = (score) => score ? Number(score).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER PROFILE */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
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
            <button onClick={handleLogout} className="px-6 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold flex items-center gap-2 transition">
              <LogOut size={18}/> Đăng xuất
            </button>
          </div>

          {/* THỐNG KÊ TỔNG QUAN */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Trophy} color="text-yellow-600" bg="bg-yellow-50" label="Điểm trung bình" value={formatScore(stats.overall_avg)} />
            <StatCard icon={Activity} color="text-blue-600" bg="bg-blue-50" label="Tổng bài thi" value={stats.total_tests} />
            <StatCard icon={Clock} color="text-purple-600" bg="bg-purple-50" label="Giờ học tập" value={`${Math.round((stats.total_time || 0) / 60)} phút`} />
            <StatCard icon={Target} color="text-green-600" bg="bg-green-50" label="Mục tiêu" value="B1/B2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CỘT TRÁI: CHI TIẾT KỸ NĂNG (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Năng lực từng kỹ năng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkillCard 
                  title="Listening" icon={Headphones} color="blue" 
                  score={formatScore(stats.listening_avg)} count={stats.listening_count} 
                />
                <SkillCard 
                  title="Reading" icon={BookOpen} color="emerald" 
                  score={formatScore(stats.reading_avg)} count={stats.reading_count} 
                />
                <SkillCard 
                  title="Writing" icon={PenTool} color="indigo" 
                  score={formatScore(stats.writing_avg)} count={stats.writing_count} 
                />
                <SkillCard 
                  title="Speaking" icon={Mic} color="orange" 
                  score={formatScore(stats.speaking_avg)} count={stats.speaking_count} 
                />
              </div>

              {/* BIỂU ĐỒ (Giả lập bằng Progress Bar) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Biểu đồ tiến bộ</h3>
                <div className="space-y-4">
                  <ProgressBar label="Listening" score={stats.listening_avg} color="bg-blue-500" />
                  <ProgressBar label="Reading" score={stats.reading_avg} color="bg-emerald-500" />
                  <ProgressBar label="Writing" score={stats.writing_avg} color="bg-indigo-500" />
                  <ProgressBar label="Speaking" score={stats.speaking_avg} color="bg-orange-500" />
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: LỊCH SỬ GẦN ĐÂY (1/3) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History size={18} className="text-gray-400"/> Hoạt động gần đây
              </h3>
              <div className="space-y-4">
                {recent_activity.length > 0 ? recent_activity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">{item.ky_nang}</p>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.tieu_de_bai_thi}</p>
                      <p className="text-xs text-gray-400">{item.ngay_lam}</p>
                    </div>
                    <div className={`font-bold text-lg ${item.diem_so >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                      {item.diem_so}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm text-center py-4">Chưa có hoạt động nào.</p>
                )}
              </div>
              <button onClick={() => navigate('/luyen-thi')} className="w-full mt-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition text-sm">
                Luyện tập ngay
              </button>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Component con: Thẻ thống kê nhỏ
const StatCard = ({ icon: Icon, color, bg, label, value }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-gray-500 text-xs font-bold uppercase">{label}</p>
      <p className="text-xl font-black text-gray-800">{value}</p>
    </div>
  </div>
);

// Component con: Thẻ kỹ năng
const SkillCard = ({ title, icon: Icon, color, score, count }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  return (
    <div className={`p-5 rounded-2xl border flex flex-col justify-between h-32 transition hover:shadow-md ${colorMap[color]}`}>
      <div className="flex justify-between items-start">
        <div className="font-bold text-lg flex items-center gap-2">
          <Icon size={20}/> {title}
        </div>
        <span className="text-xs font-bold bg-white/60 px-2 py-1 rounded-md">{count} bài</span>
      </div>
      <div className="text-4xl font-black">{score}<span className="text-sm font-medium opacity-60">/10</span></div>
    </div>
  );
};

// Component con: Thanh tiến độ
const ProgressBar = ({ label, score, color }) => (
  <div>
    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
      <span>{label}</span>
      <span>{score ? Number(score).toFixed(1) : 0}/10</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${(score || 0) * 10}%` }}></div>
    </div>
  </div>
);

export default Profile;