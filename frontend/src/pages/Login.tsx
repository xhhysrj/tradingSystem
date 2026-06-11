import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/authService';

interface RememberedUser {
  studentId: string;
  password: string;
  lastLoginAt: number;
}

const REMEMBER_USERS_KEY = 'rememberedUsers';
const MAX_REMEMBERED_USERS = 5;

export default function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberedUsers, setRememberedUsers] = useState<RememberedUser[]>([]);

  // 初始化，读取“记住我”的账号列表，回填最近一次登录的账号
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMEMBER_USERS_KEY);
      if (!raw) return;

      const list = JSON.parse(raw) as RememberedUser[];
      if (!Array.isArray(list)) return;

      const normalized = list
          .filter(item => item && typeof item.studentId === 'string' && typeof item.password === 'string')
          .map(item => ({
            studentId: item.studentId,
            password: item.password,
            lastLoginAt: typeof item.lastLoginAt === 'number' ? item.lastLoginAt : 0
          }))
          .sort((a, b) => b.lastLoginAt - a.lastLoginAt);

      setRememberedUsers(normalized);

      // 默认回填最近一次的
      if (normalized.length > 0) {
        setStudentId(normalized[0].studentId);
        setPassword(normalized[0].password);
        setRememberMe(true);
      }
    } catch (e) {
      // 解析失败就忽略
    }
  }, []);

  const saveRememberedUser = (sid: string, pwd: string) => {
    const now = Date.now();
    const next = [
      { studentId: sid, password: pwd, lastLoginAt: now },
      ...rememberedUsers.filter(u => u.studentId !== sid)
    ].slice(0, MAX_REMEMBERED_USERS);

    setRememberedUsers(next);
    localStorage.setItem(REMEMBER_USERS_KEY, JSON.stringify(next));
  };

  const removeRememberedUser = (sid: string) => {
    const next = rememberedUsers.filter(u => u.studentId !== sid);
    setRememberedUsers(next);

    if (next.length === 0) {
      localStorage.removeItem(REMEMBER_USERS_KEY);
    } else {
      localStorage.setItem(REMEMBER_USERS_KEY, JSON.stringify(next));
    }
  };

  const handleStudentIdChange = (value: string) => {
    setStudentId(value);

    // 已记住账号，自动填充密码
    const hit = rememberedUsers.find(u => u.studentId === value);
    if (hit) {
      setPassword(hit.password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim() || !password.trim()) {
      toast.error('请输入学号和密码');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ studentId, password });

      if (result.success) {
        const userData = result.user;
        if (!userData) {
          toast.error('登录返回缺少用户信息，请检查后端接口返回');
          return;
        }
        // 保存到 localStorage
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userStudentId', userData.studentId || studentId);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userMajor', userData.major || '');
        localStorage.setItem('userGrade', userData.grade || '');
        // 兼容后端可能返回 "Bearer xxx" 的情况，去掉 Bearer 前缀再存
        localStorage.setItem('token', (result.token || '').replace(/^Bearer\s+/i, ''));
        // 更新 context 状态
        setUser({
          id: userData.id,
          studentId: userData.studentId || studentId,
          name: userData.name,
          role: userData.role,
          major: userData.major || '',
          grade: userData.grade || ''
        });
        setIsAuthenticated(true);

        toast.success('登录成功');
        // 记住我，保存、移除账号
        if (rememberMe) {
          saveRememberedUser(studentId, password);
        } else {
          removeRememberedUser(studentId);
        }

        // 根据角色跳转
        if (userData.role === 'admin') {
          navigate('/admin/textbooks');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.message || '登录失败');
      }
    } catch (error: any) {
      toast.error(error.message || '登录失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-book-open text-blue-600 dark:text-blue-400 text-2xl"></i>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">登录系统</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              请输入您的学号和密码
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md -space-y-px">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  学号
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-user text-gray-400"></i>
                  </div>
                  <input
                      id="studentId"
                      name="studentId"
                      type="text"
                      autoComplete="username"
                      required
                      value={studentId}
                      onChange={(e) => handleStudentIdChange(e.target.value)}
                      list="remembered-student-ids"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入学号"
                  />
                  <datalist id="remembered-student-ids">
                    {rememberedUsers.map((u) => (
                        <option key={u.studentId} value={u.studentId} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock text-gray-400"></i>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  记住我
                </label>
              </div>

              <div className="text-sm">
                <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  忘记密码？
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> 登录中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              还没有账号？{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                立即注册
              </button>
            </p>
          </div>
        </div>

        {showForgotModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">提示</h3>
                  <button
                      onClick={() => setShowForgotModal(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                <p className="text-gray-700 dark:text-gray-300">请联系管理员处理</p>

                <div className="mt-6 flex justify-end">
                  <button
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
        )}

      </main>

      <Footer />
    </div>
  );
}