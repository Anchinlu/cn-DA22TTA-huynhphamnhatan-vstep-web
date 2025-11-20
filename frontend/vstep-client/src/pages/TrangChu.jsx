// src/pages/TrangChu.jsx

import React from 'react'; 
import { 
  BookOpen, 
  ArrowRight, 
  Check, 
  Headphones, 
  PenTool, 
  Mic, 
  Star, 
  Clock, 
  Users, 
  Send,
} from 'lucide-react';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

import HeroSlideshow from './HeroSlideshow.jsx';

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

// --- THÀNH PHẦN SKILLS (SkillsNew) ---
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
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className={`transform rounded-xl bg-white p-6 shadow-sm 
                         transition-all duration-300 ease-in-out
                         hover:shadow-md ${skill.hoverBg} 
                         ${skill.hoverTextColor}
                         hover:scale-105`}
            >
              <div 
                className={`mb-4 inline-flex rounded-full p-3 
                            transition-colors duration-300 
                            ${skill.bgColor} ${skill.hoverIconBg}`}
              >
                <skill.icon 
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



// --- THÀNH PHẦN CHÍNH: TrangChu ---
const TrangChu = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header /> {/* Tái sử dụng Header */}
      
      <main className="flex-grow">
        <HeroSlideshow />
        <About />
        <SkillsNew />
        <Courses />
        <Newsletter />
      </main>
      
      <Footer /> {/* Tái sử dụng Footer */}
    </div>
  );
};

export default TrangChu;