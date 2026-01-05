import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast'; // [MỚI] Import thư viện thông báo

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
import StudentAssignment from './pages/StudentAssignment';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import BecomeTeacher from './pages/BecomeTeacher';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminPractice from './pages/admin/AdminPractice';
import AdminMockTest from './pages/admin/AdminMockTest';
import ExamSimulation from './pages/exam/ExamSimulation';
import QuestionBank from './pages/admin/QuestionBank';
import ExamIntro from './pages/exam/ExamIntro';

function App() {
  return (
    <Router>
      {/* [MỚI] Đặt Toaster ở đây để hiển thị thông báo trên toàn app */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Công khai */}
        <Route path="/" element={<TrangChu />} />
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/practice" element={<LuyenThi />} />
        <Route path="/dictionary" element={<Dictionary />} />

        {/* TRANG CẦN BẢO VỆ */}
        <Route element={<PrivateRoute />}>
          <Route path="/practice/reading" element={<ReadingDashboard />} />
          <Route path="/practice/reading/start" element={<ReadingPractice />} />
          <Route path="/practice/listening" element={<ListeningDashboard />} />
          <Route path="/practice/listening/start" element={<ListeningPractice />} />
          <Route path="/practice/writing" element={<WritingDashboard />} />
          <Route path="/practice/writing/test" element={<WritingPractice />} />
          <Route path="/practice/speaking" element={<SpeakingDashboard />} />
          <Route path="/practice/speaking/test" element={<SpeakingPractice />} />
          <Route path="/join-class" element={<JoinClass />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/class/assignment/:id" element={<StudentAssignment />} />
          <Route path="/become-teacher" element={<BecomeTeacher />} />
          <Route path="/exam/intro/:id" element={<ExamIntro />} />
          <Route path="/exam/start/:id" element={<ExamSimulation />} />
          {/* class detail moved into admin area */}
          <Route path="/profile" element={<Profile />} />
          {/* === THÊM LẠI ROUTE NÀY CHO HỌC VIÊN === */}
          <Route path="/class/:id" element={
            <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
              <Header />
              <main className="flex-grow pt-24 pb-12 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                  <ClassDetail />
                </div>
              </main>
              <Footer />
            </div>
          } />
          {/* ======================================== */}
        
        </Route>

        {/* KHU VỰC QUẢN TRỊ (Protected) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route index element={<AdminDashboard />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="class/:id" element={<ClassDetail />} />
            <Route path="assignment/:id" element={<AssignmentDetail />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="/admin/create-practice" element={<AdminPractice />} />
            <Route path="/admin/mock-test" element={<AdminMockTest />} />
            <Route path="questions" element={<QuestionBank />} />
          </Route>
        </Route>

      </Routes>
    </Router>
    
  );
  
}

export default App;