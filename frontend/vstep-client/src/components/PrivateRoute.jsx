import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('vstep_token');
  // Nếu có token thì cho vào (Outlet), không thì đá về đăng nhập
  return token ? <Outlet /> : <Navigate to="/dang-nhap" replace />;
};

export default PrivateRoute;