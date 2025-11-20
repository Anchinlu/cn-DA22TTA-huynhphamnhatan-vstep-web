// src/pages/LuyenThi.jsx

import React from 'react';
import { 
  BookOpen, 
  ArrowRight, 
  Headphones, 
  PenTool, 
  Mic,
  FileText // Icon mới cho Thi thử
} from 'lucide-react';

// === IMPORT HEADER VÀ FOOTER TÁI SỬ DỤNG ===
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

// (Component Skills được copy từ TrangChu.jsx)
const PracticeSkills = () => {
  const skills = [
    { 
      name: "Listening", 
      description: "Luyện nghe với hàng trăm đoạn hội thoại, bài giảng đa dạng chủ đề và cấp độ.", 
      icon: Headphones, 
      href: "/practice/listening", // (Link sẽ dẫn đến trang chi tiết)
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverBg: "hover:bg-blue-600",
      hoverIconColor: "hover:text-blue-600",
      hoverIconBg: "hover:bg-white",
      hoverTextColor: "hover:text-white"
    },
    // (Thêm 3 kỹ năng còn lại)
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
  );
};


// --- THÀNH PHẦN CHÍNH: LuyenThi ---
const LuyenThi = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Nội dung trang */}
      <main className="flex-grow bg-gray-50 pt-16">
        <div className="mx-auto max-w-7xl py-12 px-4 lg:px-8">
          
          {/* Tiêu đề trang */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Trung tâm Luyện thi
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Chọn một kỹ năng để luyện tập chuyên sâu hoặc làm một bài thi thử VSTEP hoàn chỉnh.
            </p>
          </div>

          {/* Lọc (Filter) - Tạm thời */}
          <div className="mb-8 flex justify-center gap-4">
            <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm">Tất cả</button>
            <button className="rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100">Cấp độ B1</button>
            <button className="rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100">Cấp độ B2</button>
            <button className="rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100">Cấp độ C1</button>
          </div>

          {/* Phần Luyện Kỹ Năng */}
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            Luyện tập theo Kỹ năng
          </h2>
          <PracticeSkills />

          {/* Phần Thi Thử (Mock Test) */}
          <h2 className="mt-16 mb-6 text-2xl font-semibold text-gray-800">
            Làm bài Thi thử (Mock Test)
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Thẻ Thi Thử */}
            <a 
              href="/practice/mock-test-1" 
              className="group block rounded-xl bg-white p-6 shadow-sm 
                         transition-all duration-300 ease-in-out
                         hover:shadow-md hover:scale-[1.02] 
                         hover:bg-blue-600 hover:text-white"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="inline-flex rounded-full bg-blue-50 p-3 
                             transition-colors duration-300 
                             group-hover:bg-white"
                >
                  <FileText className="h-6 w-6 text-blue-600 transition-colors duration-300 group-hover:text-blue-600" />
                </div>
                <div>
                  <h3 
                    className="mb-2 text-xl font-semibold text-gray-900 
                               transition-colors duration-300
                               group-hover:text-white"
                  >
                    Đề thi VSTEP Toàn diện (Mock Test 1)
                  </h3>
                  <p 
                    className="mb-4 text-sm leading-relaxed text-gray-600 
                               transition-colors duration-300
                               group-hover:text-white"
                  >
                    Bài thi thử 4 kỹ năng đầy đủ. Thời gian: 180 phút.
                  </p>
                  <span 
                    className="inline-flex items-center text-sm font-medium 
                               text-gray-700 
                               transition-colors duration-300
                               group-hover:text-white"
                  >
                    Bắt đầu làm bài
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>
            </a>
            {/* (Bạn có thể thêm các thẻ Mock Test khác ở đây) */}
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LuyenThi;