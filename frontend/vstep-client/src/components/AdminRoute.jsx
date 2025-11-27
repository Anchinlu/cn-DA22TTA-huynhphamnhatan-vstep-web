import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const userStr = localStorage.getItem('vstep_user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (user && (user.vaiTroId === 2 || user.vaiTroId === 3)) {
    return <Outlet />; 
  }

  return <Navigate to="/" replace />;
};

export default AdminRoute;