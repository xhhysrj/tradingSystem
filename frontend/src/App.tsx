import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthContext } from '@/contexts/authContext';

// 页面组件
import Home from "@/pages/Home";
import TextbooksList from "@/pages/TextbooksList";
import TextbookDetail from "@/pages/TextbookDetail";
import PostTextbook from "@/pages/PostTextbook";
import MyCourses from "@/pages/MyCourses";
import Orders from "@/pages/Orders";
import Login from "@/pages/Login";
import MyInfo from './pages/MyInfo';
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import LoginLogs from "@/pages/LoginLogs";
import MyTextbooks from "@/pages/MyTextbooks";
import AIAssistant from "@/pages/AIAssistant";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    id: null as string | null,
    studentId: null as string | null,
    name: null as string | null,
    role: null as string | null,
    major: null as string | null,
    grade: null as string | null
  });

  // 检查本地存储中的用户信息
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userStudentId = localStorage.getItem('userStudentId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const userMajor = localStorage.getItem('userMajor');
    const userGrade = localStorage.getItem('userGrade');

    if (userId && userName && userRole) {
      setIsAuthenticated(true);
      setUser({
        id: userId,
        studentId: userStudentId,
        name: userName,
        role: userRole,
        major: userMajor,
        grade: userGrade
      });
    }
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
    setUser({
      id: null,
      studentId: null,
      name: null,
      role: null,
      major: null,
      grade: null
    });
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userStudentId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userMajor');
    localStorage.removeItem('userGrade');
  };

  return (
      <AuthContext.Provider value={{ isAuthenticated, user, setIsAuthenticated, setUser, logout }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/textbooks" element={<TextbooksList />} />
          <Route path="/textbook/:id" element={<TextbookDetail />} />
          <Route path="/post" element={<PostTextbook />} />
          <Route path="/my-textbooks" element={<MyTextbooks />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/my-info" element={<MyInfo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/users" element={<Admin />} />
          <Route path="/admin/textbooks" element={<Admin />} />
          <Route path="/admin/logs" element={<LoginLogs />} />
        </Routes>
      </AuthContext.Provider>
  );
}

