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
import ReadingDashboard from './pages/practice/ReadingDashboard.jsx'; 
import ReadingPractice from './pages/practice/ReadingPractice.jsx';
import ListeningDashboard from './pages/practice/ListeningDashboard.jsx';
import ListeningPractice from './pages/practice/ListeningPractice.jsx';
import WritingDashboard from './pages/practice/WritingDashboard.jsx';
import WritingPractice from './pages/practice/WritingPractice.jsx';
import SpeakingDashboard from './pages/practice/SpeakingDashboard.jsx';
import SpeakingPractice from './pages/practice/SpeakingPractice.jsx';
import Dictionary from './pages/Dictionary.jsx';
import JoinClass from './pages/JoinClass.jsx';
import MyCourses from './pages/MyCourses.jsx';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement.jsx';
import ClassManagement from './pages/admin/ClassManagement.jsx';
import ClassDetail from './pages/ClassDetail.jsx';
import AssignmentDetail from './pages/admin/AssignmentDetail.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Công khai */}
        <Route path="/" element={<TrangChu />} />
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} /> 
        <Route path="/practice" element={<LuyenThi />} />
        <Route path="/dictionary" element={<Dictionary />} />

        {/* TRANG CẦN BẢO VỆ */}
        <Route element={<PrivateRoute />}>
          <Route path="/practice/reading" element={<ReadingDashboard />} />
          <Route path="/practice/reading/test" element={<ReadingPractice />} />
          <Route path="/practice/listening" element={<ListeningDashboard />} />
          <Route path="/practice/listening/test" element={<ListeningPractice />} />
          <Route path="/practice/writing" element={<WritingDashboard />} />
          <Route path="/practice/writing/test" element={<WritingPractice />} />
          <Route path="/practice/speaking" element={<SpeakingDashboard />} />
          <Route path="/practice/speaking/test" element={<SpeakingPractice />} />
          <Route path="/join-class" element={<JoinClass />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/class/:id" element={<ClassDetail />} />
        
        </Route>

        {/* KHU VỰC QUẢN TRỊ (Protected) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="assignment/:id" element={<AssignmentDetail />} />
          </Route>
        </Route>

      </Routes>
    </Router>
    
  );
  
}

export default App;