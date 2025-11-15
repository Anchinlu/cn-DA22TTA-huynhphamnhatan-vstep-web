import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// Import các trang của bạn
import TrangChu from './pages/TrangChu.jsx';
import DangNhap from './pages/DangNhap.jsx';
import DangKy from './pages/DangKy.jsx'; // <-- THÊM DÒNG NÀY

function App() {
  return (
    <Router>
      <Routes>
        {/* Route cho Trang chủ */}
        <Route path="/" element={<TrangChu />} />
        
        {/* Route cho Trang Đăng nhập */}
        <Route path="/dang-nhap" element={<DangNhap />} />
        
        {/* (MỚI) Route cho Trang Đăng ký */}
        <Route path="/dang-ky" element={<DangKy />} /> 
      </Routes>
    </Router>
  );
}

export default App;