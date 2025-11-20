import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// Import các trang của bạn
import TrangChu from './pages/TrangChu.jsx';
import DangNhap from './pages/DangNhap.jsx';
import DangKy from './pages/DangKy.jsx'; 
import LuyenThi from './pages/LuyenThi.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrangChu />} />
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} /> 
        <Route path="/practice" element={<LuyenThi />} />
      </Routes>
    </Router>
  );
}

export default App;