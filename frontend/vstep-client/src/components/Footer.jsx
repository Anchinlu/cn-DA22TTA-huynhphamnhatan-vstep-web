import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-400 text-sm border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-6 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Cột 1: Logo & Slogan */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">VSTEP Pro</span>
            </Link>
            <p className="leading-relaxed text-xs">
              Nền tảng luyện thi VSTEP thông minh, giúp bạn chinh phục chứng chỉ B1, B2, C1 dễ dàng hơn bao giờ hết.
            </p>
          </div>

          {/* Cột 2: Liên kết */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Khám phá</h3>
            <ul className="space-y-2">
              <li><Link to="/practice/listening" className="hover:text-blue-400 transition">Luyện Nghe</Link></li>
              <li><Link to="/practice/reading" className="hover:text-emerald-400 transition">Luyện Đọc</Link></li>
              <li><Link to="/practice/writing" className="hover:text-indigo-400 transition">Luyện Viết</Link></li>
              <li><Link to="/practice/speaking" className="hover:text-orange-400 transition">Luyện Nói</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Liên hệ</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Kết nối</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-blue-500" />
                <span>Đại học Trà Vinh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-500" />
                <a href="mailto:support@vstep.edu.vn" className="hover:text-white transition">support@vstep.edu.vn</a>
              </li>
              <li className="flex gap-4 pt-2">
                <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition"><Facebook size={16}/></a>
                <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-red-600 hover:text-white transition"><Youtube size={16}/></a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-60">© {new Date().getFullYear()} VSTEP Master. All rights reserved.</p>
          <div className="flex gap-6 text-xs font-medium">
             <span className="opacity-60 hover:opacity-100 cursor-pointer">Privacy</span>
             <span className="opacity-60 hover:opacity-100 cursor-pointer">Terms</span>
             <span className="opacity-60 hover:opacity-100 cursor-pointer">Sitemap</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;