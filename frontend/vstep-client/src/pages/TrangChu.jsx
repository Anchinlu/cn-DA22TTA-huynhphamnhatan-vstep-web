import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Menu, 
  X, 
  ArrowRight, 
  Check, 
  Headphones, 
  PenTool, 
  Mic, 
  Star, 
  Clock, 
  Users, 
  Send, 
  Facebook, 
  Youtube, 
  Mail,
  User,
  LogOut 
} from 'lucide-react';

import HeroSlideshow from './HeroSlideshow.jsx';

// --- THÀNH PHẦN HEADER ---
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Dùng để tham chiếu đến menu

  useEffect(() => {
    // Lấy thông tin user khi trang tải
    const userData = localStorage.getItem('vstep_user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); 
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Dọn dẹp event listener khi component bị gỡ
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]); 

  const handleLogout = () => {
    localStorage.removeItem('vstep_token');
    localStorage.removeItem('vstep_user');
    setCurrentUser(null);
    setIsDropdownOpen(false);
    window.location.href = '/'; 
  };

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Luyện thi', href: '/practice' },
    { name: 'Từ điển', href: '/dictionary' },
    { name: 'Lớp học', href: '/class' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex flex-shrink-0 items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="ml-2 hidden text-lg font-semibold text-gray-900 lg:block">
              VSTEP Practice Platform
            </span>
          </div>

          {/* Cụm bên phải (Desktop) */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            
            <nav className="flex space-x-6">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="h-6 w-px bg-gray-300" />

            {isSearchOpen ? (
              <div className="relative flex items-center transition-all duration-300 ease-in-out">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-48 rounded-full border border-gray-300 py-2 px-4 text-sm"
                  onBlur={() => setIsSearchOpen(false)}
                  autoFocus
                />
                <Search className="absolute right-3 h-5 w-5 text-gray-400" />
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300 ease-in-out"
              >
                <Search className="h-6 w-6" />
              </button>
            )}

            {/* Logic Hiển thị Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Bật/tắt menu
                    className="flex rounded-full"
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.hoTen)}&background=0D8ABC&color=fff`}
                      alt={currentUser.hoTen}
                    />
                  </button>
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div className="py-1">
                        <div className="border-b border-gray-200 px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser.hoTen}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {currentUser.email}
                          </p>
                        </div>
                        
                        <a
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Bảng điều khiển
                        </a>
                        <a
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Thông tin tài khoản
                        </a>

                        <button
                          onClick={handleLogout}
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a 
                  href="/dang-nhap" 
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  title="Đăng nhập"
                >
                  <User className="h-6 w-6" />
                </a>
              )}
            </div>
            
          </div>

          {/* Cụm bên phải (Mobile) */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
              <Search className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menu thả xuống (Mobile) */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 lg:hidden">
          <nav className="space-y-1 px-2 pt-2 pb-3">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                {item.name}
              </a>
            ))}
          </nav>
          <div className="border-t border-gray-200 px-2 pt-4 pb-3">
            {currentUser ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.hoTen)}&background=0D8ABC&color=fff`}
                    alt={currentUser.hoTen}
                  />
                  <span className="text-base font-medium text-gray-800">
                    {currentUser.hoTen}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center rounded-md border border-red-500 bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <a 
                href="/dang-nhap"
                className="flex w-full items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <User className="mr-2 h-5 w-5" />
                Đăng nhập / Đăng ký
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// --- THÀNH PHẦN ABOUT ---
const About = () => {
  const features = [
    { text: "Hơn 1000+ bài tập thực hành" },
    { text: "Đề thi mô phỏng 100% chuẩn format" },
    { text: "Phản hồi chi tiết và hướng dẫn" },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
        
        <div className="lg:order-last">
          <img 
            src="/img/reading.jpg" 
            alt="Học viên đang luyện đọc VSTEP" 
            className="h-full w-full max-h-[400px] rounded-2xl object-cover shadow-lg"
          />
        </div>

        <div className="lg:order-first">
          <h2 className="text-3xl font-bold text-gray-900">
            VSTEP Practice Platform là gì?
          </h2>
          <p className="mb-6 mt-6 text-base leading-relaxed text-gray-600">
            Đây là nền tảng học tập trực tuyến tập trung vào việc luyện thi VSTEP, cung cấp một lộ trình rõ ràng và tài nguyên phong phú để bạn đạt được band điểm mong muốn.
          </p>
          <ul className="mb-8 space-y-3">
            {features.map((feature) => (
              <li key={feature.text} className="flex items-center text-base text-gray-700">
                <Check className="mr-3 h-6 w-6 flex-shrink-0 text-green-600" />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
          <a
            href="/courses"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Khám phá ngay
          </a>
        </div>
      </div>
    </section>
  );
};

const SkillsNew = () => {
  const skills = [
    { 
      name: "Listening", 
      description: "Luyện nghe với hàng trăm đoạn hội thoại, bài giảng đa dạng chủ đề và cấp độ.", 
      icon: Headphones, 
      href: "/practice/listening",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverBg: "hover:bg-blue-600",
      hoverIconColor: "hover:text-blue-600",
      hoverIconBg: "hover:bg-white",
      hoverTextColor: "hover:text-white"
    },
    { 
      name: "Reading", 
      description: "Rèn luyện kỹ năng đọc hiểu, phân tích thông tin qua các bài đọc chuẩn VSTEP.", 
      icon: BookOpen, 
      href: "/practice/reading",
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      hoverBg: "hover:bg-green-600",
      hoverIconColor: "hover:text-green-600",
      hoverIconBg: "hover:bg-white",
      hoverTextColor: "hover:text-white"
    },
    { 
      name: "Writing", 
      description: "Thực hành viết luận, thư tín và nhận phản hồi chi tiết từ hệ thống và giáo viên.", 
      icon: PenTool, 
      href: "/practice/writing",
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-600",
      hoverIconColor: "hover:text-indigo-600",
      hoverIconBg: "hover:bg-white",
      hoverTextColor: "hover:text-white"
    },
    { 
      name: "Speaking", 
      description: "Luyện nói với các tình huống giao tiếp, chủ đề thảo luận và ghi âm bài nói.", 
      icon: Mic, 
      href: "/practice/speaking",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      hoverBg: "hover:bg-orange-600",
      hoverIconColor: "hover:text-orange-600",
      hoverIconBg: "hover:bg-white",
      hoverTextColor: "hover:text-white"
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            4 Kỹ năng luyện tập toàn diện
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Chúng tôi cung cấp hệ thống bài tập đầy đủ cho 4 kỹ năng quan trọng nhất của kỳ thi VSTEP.
          </p>
        </div>
        
        {/* 2. Cập nhật JSX (Sửa lỗi hover text) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              // Thẻ div cha
              className={`transform rounded-xl bg-white p-6 shadow-sm 
                         transition-all duration-300 ease-in-out
                         hover:shadow-md ${skill.hoverBg} 
                         ${skill.hoverTextColor}  /* <-- Đổi text (cha) sang trắng */
                         hover:scale-105`} /* <-- Thêm phóng to */
            >
              <div 
                // Nền Icon
                className={`mb-4 inline-flex rounded-full p-3 
                            transition-colors duration-300 
                            ${skill.bgColor} ${skill.hoverIconBg}`}
              >
                <skill.icon 
                  // Icon
                  className={`h-6 w-6 
                              transition-colors duration-300 
                              ${skill.iconColor} ${skill.hoverIconColor}`}
                />
              </div>
              <h3 
                className={`mb-2 text-xl font-semibold text-gray-900 
                           transition-colors duration-300
                           ${skill.hoverTextColor}`}
              >
                {skill.name}
              </h3>
              <p 
                className={`mb-4 text-sm leading-relaxed text-gray-600 
                           transition-colors duration-300
                           ${skill.hoverTextColor}`}
              >
                {skill.description}
              </p>
              <a 
                href={skill.href} 
                className={`inline-flex items-center text-sm font-medium 
                            text-gray-700 
                            transition-colors duration-300
                            ${skill.hoverTextColor}`} 
              >
                Luyện ngay
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- THÀNH PHẦN COURSES ---
const Courses = () => {
  const courses = [
    { title: "VSTEP Cơ bản - B1", description: "Khóa học dành cho người mới bắt đầu, củng cố nền tảng ngữ pháp và từ vựng.", duration: "8 tuần", students: "2,450", rating: 4.8, gradient: "from-blue-100 to-blue-200" },
    { title: "VSTEP Trung cấp - B2", description: "Nâng cao kỹ năng tiếng Anh học thuật, tập trung vào chiến thuật làm bài thi.", duration: "10 tuần", students: "3,120", rating: 4.9, gradient: "from-green-100 to-green-200" },
    { title: "VSTEP Nâng cao - C1", description: "Khóa học chuyên sâu dành cho người muốn đạt điểm cao, luyện đề nâng cao.", duration: "12 tuần", students: "1,890", rating: 4.9, gradient: "from-orange-100 to-orange-200" }
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Khóa học nổi bật
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Chọn khóa học phù hợp với trình độ và mục tiêu của bạn.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {courses.map((course) => (
            <div key={course.title} className="flex flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div className={`h-48 w-full bg-gradient-to-br ${course.gradient}`} />
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {course.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600">
                    {course.description}
                  </p>
                </div>
                <div>
                  <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{course.duration}</span>
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{course.students} học viên</span>
                    <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400 fill-current" /> {course.rating}</span>
                  </div>
                  <button className="w-full rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    Tham gia
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- THÀNH PHẦN NEWSLETTER ---
const Newsletter = () => {
  return (
    <section className="bg-blue-50 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Nhận tài liệu và mẹo luyện thi VSTEP miễn phí!
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Đăng ký để nhận các bài thi thử, từ vựng và chiến thuật làm bài mới nhất trực tiếp vào email của bạn.
        </p>
        <form className="mx-auto mt-10 max-w-md">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="email" className="sr-only">Email</label>
            <input type="email" id="email" required className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base placeholder-gray-500 shadow-sm focus:border-blue-600 focus:ring-blue-600" placeholder="Nhập email của bạn" />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
              Đăng ký
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Chúng tôi cam kết bảo mật thông tin. Không spam.
          </p>
        </form>
      </div>
    </section>
  );
};

// --- THÀNH PHẦN FOOTER ---
const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8" /><span className="ml-2 text-lg font-semibold">VSTEP Practice Platform</span>
            </div>
            <p className="text-sm text-blue-200">
              Nền tảng luyện thi VSTEP trực tuyến hàng đầu, giúp bạn đạt được mục tiêu học tập một cách hiệu quả nhất.
            </p>
          </div>
          <div className="md:mx-auto">
            <h3 className="text-lg font-semibold">Liên kết nhanh</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="/about" className="text-sm text-blue-200 hover:text-white">Giới thiệu</a></li>
              <li><a href="/courses" className="text-sm text-blue-200 hover:text-white">Khóa học</a></li>
              <li><a href="/practice" className="text-sm text-blue-200 hover:text-white">Đề thi mẫu</a></li>
              <li><a href="/blog" className="text-sm text-blue-200 hover:text-white">Blog học tập</a></li>
              <li><a href="/contact" className="text-sm text-blue-200 hover:text-white">Liên hệ</a></li>
            </ul>
          </div>
          <div className="md:mx-auto">
            <h3 className="text-lg font-semibold">Kết nối</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4" /><span className="text-sm text-blue-200">support@vsteppractice.com</span></li>
              <li className="flex items-center gap-3"><span className="text-sm text-blue-200">Hotline: 1900 xxxx</span></li>
              <li className="flex items-center space-x-3">
                <a href="#" className="rounded-full bg-blue-800 p-2 text-blue-200 hover:bg-blue-700 hover:text-white"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="rounded-full bg-blue-800 p-2 text-blue-200 hover:bg-blue-700 hover:text-white"><Youtube className="h-5 w-5" /></a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-blue-800 pt-8 text-center">
          <p className="text-sm text-blue-200">
            © 2024 VSTEP Practice Platform. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};


// --- THÀNH PHẦN CHÍNH: TrangChu ---
const TrangChu = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSlideshow />
        <About />
        <SkillsNew />
        <Courses />
        <Newsletter />
      </main>
      
      <Footer />
    </div>
  );
};

export default TrangChu;