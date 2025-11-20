// src/components/Footer.jsx

import React from 'react';
import { BookOpen, Facebook, Youtube, Mail } from 'lucide-react';

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

export default Footer;