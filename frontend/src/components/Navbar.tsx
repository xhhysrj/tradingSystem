import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isStudent = isAuthenticated && user?.role === 'student';
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        isActive
            ? 'border-blue-500 text-gray-900 dark:text-white'
            : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
    }`;
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
        isActive
            ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-200'
            : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
    }`;
  };

  const roleText = user?.role === 'admin' ? '管理员' : '学生';
  const displayStudentId = user?.studentId || '';

  return (
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                  教材交易系统
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className={getLinkClass("/")}>
                  首页
                </Link>

                {/* 学生菜单 */}
                {isStudent && (
                    <>
                      <Link to="/textbooks" className={getLinkClass("/textbooks")}>
                        教材列表
                      </Link>
                      <Link to="/post" className={getLinkClass("/post")}>
                        发布教材
                      </Link>
                      <Link to="/my-textbooks" className={getLinkClass("/my-textbooks")}>
                        我的发布
                      </Link>
                      <Link to="/ai" className={getLinkClass("/ai")}>
                        AI助手
                      </Link>
                      <Link to="/my-courses" className={getLinkClass("/my-courses")}>
                        我的课程
                      </Link>
                      <Link to="/orders" className={getLinkClass("/orders")}>
                        订单中心
                      </Link>
                      <Link to="/my-info" className={getLinkClass("/my-info")}>
                        我的信息
                      </Link>
                    </>
                )}

                {/* 管理员菜单 */}
                {isAdmin && (
                    <>
                      <Link to="/admin/textbooks" className={getLinkClass("/admin/textbooks")}>
                        教材审核
                      </Link>
                      <Link to="/admin/users" className={getLinkClass("/admin/users")}>
                        用户管理
                      </Link>
                      <Link to="/admin/logs" className={getLinkClass("/admin/logs")}>
                        登录日志
                      </Link>
                    </>
                )}

                {/* 未登录用户 */}
                {!isAuthenticated && (
                    <Link to="/textbooks" className={getLinkClass("/textbooks")}>
                      教材列表
                    </Link>
                )}
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* 登录用户信息展示 */}
              {isAuthenticated && (
                  <div className="mr-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 flex items-center justify-center font-bold">
                      {(user?.name || '?').slice(0, 1)}
                    </div>
                    <div className="ml-2 leading-tight">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {displayStudentId
                            ? `学号：${displayStudentId} · ${roleText}`
                            : roleText}
                      </div>
                    </div>
                  </div>
              )}

              <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              >
                {theme === 'light' ? (
                    <i className="fa-solid fa-moon"></i>
                ) : (
                    <i className="fa-solid fa-sun"></i>
                )}
              </button>

              {isAuthenticated ? (
                  <button
                      onClick={handleLogout}
                      className="ml-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    退出登录
                  </button>
              ) : (
                  <>
                    <Link
                        to="/login"
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      登录
                    </Link>
                    <Link
                        to="/register"
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      注册
                    </Link>
                  </>
              )}
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} h-6 w-6`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 shadow-lg">
                {/* 移动端登录用户信息展示 */}
                {isAuthenticated && (
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {displayStudentId ? `${displayStudentId} · ${roleText}` : roleText}
                      </div>
                    </div>
                )}

                <Link to="/" className={getMobileLinkClass("/")}>首页</Link>

                {/* 学生菜单 */}
                {isStudent && (
                    <>
                      <Link to="/textbooks" className={getMobileLinkClass("/textbooks")}>教材列表</Link>
                      <Link to="/post" className={getMobileLinkClass("/post")}>发布教材</Link>
                      <Link to="/my-textbooks" className={getMobileLinkClass("/my-textbooks")}>我的发布</Link>
                      <Link to="/ai" className={getMobileLinkClass("/ai")}>AI助手</Link>
                      <Link to="/my-courses" className={getMobileLinkClass("/my-courses")}>我的课程</Link>
                      <Link to="/orders" className={getMobileLinkClass("/orders")}>订单中心</Link>
                      <Link to="/my-info" className={getLinkClass("/my-info")}>我的信息</Link>
                    </>
                )}

                {/* 管理员菜单 */}
                {isAdmin && (
                    <>
                      <Link to="/admin/textbooks" className={getMobileLinkClass("/admin/textbooks")}>教材审核</Link>
                      <Link to="/admin/users" className={getMobileLinkClass("/admin/users")}>用户管理</Link>
                      <Link to="/admin/logs" className={getMobileLinkClass("/admin/logs")}>登录日志</Link>
                    </>
                )}

                {/* 未登录用户 */}
                {!isAuthenticated && (
                    <Link to="/textbooks" className={getMobileLinkClass("/textbooks")}>
                      教材列表
                    </Link>
                )}

                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                    >
                      退出登录
                    </button>
                )}

                {!isAuthenticated && (
                    <>
                      <Link
                          to="/login"
                          className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                      >
                        登录
                      </Link>
                      <Link
                          to="/register"
                          className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        注册
                      </Link>
                    </>
                )}

                <div className="px-4 py-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">主题</span>
                  <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                  >
                    {theme === 'light' ? (
                        <i className="fa-solid fa-moon"></i>
                    ) : (
                        <i className="fa-solid fa-sun"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
        )}
      </nav>
  );
}

