import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, Sparkles, 
  Users, BookOpen, Trophy, Star,
  Headphones, PenTool, Mic, MousePointerClick,
  ShieldCheck, Zap, Quote, GraduationCap, BarChart, Layout, Loader2
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// --- HOOK & COMPONENT CHO HIỆU ỨNG SCROLL ---
const useOnScreen = (options) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target); 
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [options]);

  return [ref, isVisible];
};

const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  
  let translateClass = 'translate-y-10';
  if (direction === 'left') translateClass = '-translate-x-10';
  if (direction === 'right') translateClass = 'translate-x-10';

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out transform ${className} ${
        isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${translateClass}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const TrangChu = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 1: Học viên, 2: Giáo viên
  
  // State thống kê thật
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalTests: 50 
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Kiểm tra đăng nhập & Lấy số liệu thật
  useEffect(() => {
    const token = localStorage.getItem('vstep_token');
    const userStr = localStorage.getItem('vstep_user');
    
    if (token && userStr) {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserRole(user.vaiTroId);
    }

    // Gọi API lấy thống kê thật
    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/dashboard/stats', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if(res.ok) {
                const data = await res.json();
                setStats(prev => ({
                    ...prev,
                    totalClasses: data.totalClasses || 0,
                    totalStudents: data.totalStudents || 0,
                    totalTeachers: data.totalTeachers || 0,
                    totalTests: data.totalTests || 50 
                }));
            }
        } catch (error) {
            console.error("Lỗi tải thống kê:", error);
        } finally {
            setLoadingStats(false);
        }
    };
    
    fetchStats();

  }, []);

  // Xử lý nút bấm chính (Hero Section)
  const handleMainAction = () => {
      if (isLoggedIn) {
          if (userRole === 2) {
             navigate('/admin/dashboard'); 
          } else {
             navigate('/profile'); 
          }
      } else {
          navigate('/login'); 
      }
  };

  // Xử lý nút Teacher Action (ĐÃ CẬP NHẬT LOGIC)
  const handleTeacherAction = () => {
      if (isLoggedIn) {
        if (userRole === 2) {
             // Đã là Giáo viên -> Vào trang quản lý
             navigate('/admin/'); 
        } else {
             // Là Học viên -> Vào trang xin nâng cấp
             navigate('/become-teacher'); 
        }
      } else {
          // Chưa đăng nhập -> Vào trang đăng ký tài khoản
          navigate('/register'); 
      }
  };

  // Dữ liệu mẫu
  const skills = [
    { id: 'listening', title: 'Listening', desc: 'Luyện nghe đa giọng đọc chuẩn VSTEP', icon: Headphones, color: 'text-blue-500', bg: 'bg-blue-50', link: '/practice/listening' },
    { id: 'reading', title: 'Reading', desc: 'Kho bài đọc phong phú mọi chủ đề', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/practice/reading' },
    { id: 'writing', title: 'Writing', desc: 'Trợ lí Chinhlu chấm điểm & sửa lỗi ngữ pháp', icon: PenTool, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/practice/writing' },
    { id: 'speaking', title: 'Speaking', desc: 'Phòng thu âm ảo chấm phát âm', icon: Mic, color: 'text-orange-500', bg: 'bg-orange-50', link: '/practice/speaking' }
  ];

  const steps = [
    { num: '01', title: 'Chọn kỹ năng', desc: 'Lựa chọn 1 trong 4 kỹ năng bạn muốn ôn luyện.' },
    { num: '02', title: 'Làm bài thi', desc: 'Thực hành với kho đề thi sát thực tế, có bấm giờ.' },
    { num: '03', title: 'Nhận kết quả từ Trợ lí Chinhlu', desc: 'Xem điểm số và nhận xét chi tiết ngay lập tức.' }
  ];

  const testimonials = [
    { name: "Minh Anh", role: "Sinh viên ĐH QGHN", content: "Nhờ tính năng chấm Writing của Trợ lí Chinhlu mà mình đã nâng band điểm từ B1 lên B2 chỉ sau 2 tuần.", avatar: "M" },
    { name: "Tuấn Hưng", role: "Người đi làm", content: "Giao diện rất dễ dùng, tranh thủ giờ nghỉ trưa vào luyện Speaking cực tiện.", avatar: "T" },
    { name: "Lan Chi", role: "Học sinh THPT", content: "Kho đề Reading rất sát với đề thi thật. Cảm ơn đội ngũ phát triển!", avatar: "L" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-grow">
        
        {/* 1. HERO SECTION */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 w-full h-full pointer-events-none">
             <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              <Reveal direction="left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 text-sm font-semibold shadow-lg">
                  <Sparkles size={16} className="text-yellow-400 animate-spin-slow" /> 
                  <span>Công nghệ Trợ lí Chinhlu chấm thi VSTEP 2025</span>
                </div>
              </Reveal>
              
              <Reveal delay={200}>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                  Luyện thi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">VSTEP</span> <br/>
                  Chuẩn Quốc Tế
                </h1>
              </Reveal>

              <Reveal delay={400}>
                <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Nền tảng luyện thi thông minh giúp bạn chinh phục chứng chỉ B1, B2, C1. 
                  Tự động chấm điểm, phân tích lỗi sai và gợi ý lộ trình học tập cá nhân hóa.
                </p>
              </Reveal>
              
              <Reveal delay={600}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={handleMainAction}
                    className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 min-w-[200px]"
                  >
                    {isLoggedIn ? (userRole === 2 ? 'Quản lý Lớp học' : 'Vào học ngay') : 'Bắt đầu ngay'} 
                    <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </div>
              </Reveal>

              <Reveal delay={800}>
                <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-400 font-medium">
                   <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400"/> Miễn phí trọn đời</div>
                   <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400"/> Trợ lí Chinhlu chấm điểm</div>
                   <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400"/> Đề thi mới nhất</div>
                </div>
              </Reveal>
            </div>

            <Reveal direction="right" delay={400} className="order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg lg:max-w-xl">
                    <div className="relative z-10 bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
                        <img 
                            src="/img/01.png" 
                            alt="App Dashboard Interface" 
                            className="w-full h-auto opacity-95 object-cover"
                            onError={(e) => {e.target.src='https://via.placeholder.com/800x600/1e293b/ffffff?text=VSTEP+Web+Platform'}}
                        />
                    </div>
                </div>
            </Reveal>
          </div>
        </section>

        {/* 2. STATS SECTION */}
        <section className="relative z-20 -mt-10 max-w-5xl mx-auto px-6">
            <Reveal delay={200}>
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Đề thi chuẩn", val: stats.totalTests + "+", icon: BookOpen, color: "text-blue-600" },
                        { label: "Học viên", val: stats.totalStudents || "100+", icon: Users, color: "text-indigo-600" },
                        { label: "Lớp học", val: stats.totalClasses || "50+", icon: Layout, color: "text-purple-600" },
                        { label: "Giáo viên", val: stats.totalTeachers || "20+", icon: GraduationCap, color: "text-orange-600" },
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 text-center group">
                            <s.icon className={`w-8 h-8 ${s.color} transform group-hover:scale-110 transition-transform`} />
                            <span className="text-3xl font-black text-slate-800">{loadingStats ? <Loader2 className="animate-spin inline"/> : s.val}</span>
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">{s.label}</span>
                        </div>
                    ))}
                </div>
            </Reveal>
        </section>

        {/* 3. SKILLS SECTION */}
        <section className="py-24 bg-slate-50">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <Reveal>
                        <h2 className="text-4xl font-black text-slate-900">Luyện Thi 4 Kỹ Năng Toàn Diện</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                            Hệ thống bài tập được thiết kế chuyên sâu, bám sát cấu trúc đề thi VSTEP mới nhất.
                        </p>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {skills.map((s, i) => (
                        <Reveal key={s.id} delay={i * 100}>
                            <div 
                                onClick={() => navigate(s.link)}
                                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group h-full flex flex-col"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <s.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{s.title}</h3>
                                <p className="text-slate-500 leading-relaxed mb-6 flex-1">{s.desc}</p>
                                <div className={`font-bold text-sm ${s.color} flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300`}>
                                    Bắt đầu ngay <ArrowRight size={16}/>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>

        {/* 4. AI FEATURE SECTION */}
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <Reveal direction="left">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
                                <img src="/img/writing.jpg" alt="Trợ lí Chinhlu Grading" className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover transform transition-transform hover:scale-[1.02] duration-500" />
                                
                                <div className="absolute bottom-8 right-8 bg-white p-6 rounded-2xl shadow-xl max-w-xs animate-bounce-slow hidden sm:block">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Sparkles className="text-yellow-500" />
                                        <span className="font-bold text-slate-800">Phân tích bởi Trợ lí Chinhlu</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm"><span className="font-bold text-green-600">Score:</span> 7.5/10</div>
                                        <div className="flex items-center gap-2 text-sm"><span className="font-bold text-red-500">Grammar:</span> 3 errors</div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                    <div className="lg:w-1/2 space-y-8">
                        <Reveal direction="right">
                            <div className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold border border-blue-100">
                                ✨ Công nghệ độc quyền
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 leading-tight mt-4">
                                Chấm điểm Writing & Speaking bằng <span className="text-blue-600">Trợ lí Chinhlu</span>
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Không còn phải chờ đợi giáo viên. Trợ lí Chinhlu sẽ phân tích bài làm của bạn trong tích tắc, chỉ ra lỗi sai ngữ pháp, từ vựng và gợi ý cách sửa để nâng band điểm nhanh chóng.
                            </p>
                            <ul className="space-y-4">
                                {["Chấm điểm theo thang chuẩn VSTEP", "Phát hiện lỗi sai chính tả, ngữ pháp", "Gợi ý từ vựng nâng cao (C1/C2)", "Nhận xét chi tiết từng tiêu chí"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <div className="p-1 bg-green-100 rounded-full"><CheckCircle2 size={16} className="text-green-600"/></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>

        {/* 5. TEACHER & CLASSROOM SECTION (NÚT BẤM ĐÃ CẬP NHẬT) */}
        <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 space-y-8 order-2 lg:order-1">
                        <Reveal direction="left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-semibold">
                                <GraduationCap size={16} /> Dành cho Giáo viên & Trường học
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black leading-tight mt-4">
                                Quản lý Lớp học <br/> <span className="text-emerald-400">Hiệu quả & Dễ dàng</span>
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                VSTEP Master cung cấp hệ thống LMS (Learning Management System) mạnh mẽ giúp giáo viên tạo lớp, giao bài tập và theo dõi tiến độ của học sinh hoàn toàn tự động.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-slate-700 rounded-xl h-fit"><Layout size={24} className="text-emerald-400"/></div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Tạo lớp học</h4>
                                        <p className="text-slate-400 text-sm">Tạo mã lớp riêng, học sinh tham gia dễ dàng chỉ với 1 cú click.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="p-3 bg-slate-700 rounded-xl h-fit"><BookOpen size={24} className="text-blue-400"/></div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Kho đề thi phong phú</h4>
                                        <p className="text-slate-400 text-sm">Sử dụng kho đề có sẵn của hệ thống hoặc tự tạo đề thi riêng cho lớp.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="p-3 bg-slate-700 rounded-xl h-fit"><BarChart size={24} className="text-purple-400"/></div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Sổ điểm điện tử</h4>
                                        <p className="text-slate-400 text-sm">Hệ thống tự động chấm điểm và tổng hợp báo cáo chi tiết từng kỹ năng.</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleTeacherAction}
                                className="mt-4 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/50 transition-all flex items-center gap-2"
                            >
                                {isLoggedIn && userRole === 2 ? 'Quản lý lớp học ngay' : 'Đăng ký tài khoản Giáo viên'} <ArrowRight size={20}/>
                            </button>
                        </Reveal>
                    </div>

                    <div className="lg:w-1/2 order-1 lg:order-2">
                        <Reveal direction="right">
                            <div className="relative bg-white rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">GV</div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">Lớp VSTEP B1-K12</h4>
                                            <p className="text-xs text-slate-500">32 Học viên</p>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">+ Giao bài</button>
                                </div>
                                <div className="space-y-3">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">Nguyễn Văn A</p>
                                                    <p className="text-[10px] text-slate-400">Nộp bài: 2 phút trước</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">8.5/10</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>

        {/* 6. HOW IT WORKS */}
        <section className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Lộ trình 3 bước đơn giản</h2>
                        <p className="text-slate-600 text-lg">Bắt đầu hành trình chinh phục VSTEP ngay hôm nay</p>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 border-t border-dashed border-slate-300 z-0"></div>
                    {steps.map((step, i) => (
                        <Reveal key={i} delay={i * 200}>
                            <div className="relative z-10 flex flex-col items-center text-center group">
                                <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center text-3xl font-black text-blue-600 mb-6 group-hover:border-blue-500 group-hover:scale-110 transition-all duration-300 shadow-xl">
                                    {step.num}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed px-4">{step.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>

        {/* 7. TESTIMONIALS */}
        <section className="py-24 bg-slate-50">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Học viên nói gì về chúng tôi?</h2>
                        <p className="text-slate-600 text-lg">Hàng ngàn câu chuyện thành công bắt đầu từ đây</p>
                    </Reveal>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <Reveal key={i} delay={i * 100}>
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                                <Quote className="text-blue-200 mb-6" size={40} />
                                <p className="text-slate-600 italic mb-6 flex-1 text-lg leading-relaxed">"{t.content}"</p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{t.name}</h4>
                                        <p className="text-sm text-slate-500 uppercase font-semibold">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>

        {/* 8. CTA SECTION */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <Reveal>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                        Đừng để tiếng Anh cản trở <br/> tương lai của bạn.
                    </h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                        Tham gia cộng đồng hơn 10,000 học viên đang luyện thi VSTEP mỗi ngày.
                    </p>
                    <button 
                        onClick={handleMainAction}
                        className="px-12 py-5 bg-white text-blue-700 rounded-2xl font-black text-xl shadow-2xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
                    >
                        <MousePointerClick size={24}/> {isLoggedIn ? 'Vào Dashboard ngay' : 'Đăng ký tài khoản miễn phí'}
                    </button>
                    <p className="mt-6 text-sm text-blue-200 opacity-80 flex justify-center gap-6">
                        <span className="flex items-center gap-1"><ShieldCheck size={16}/> Bảo mật thông tin</span>
                        <span className="flex items-center gap-1"><Zap size={16}/> Kích hoạt tức thì</span>
                    </p>
                </Reveal>
            </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default TrangChu;