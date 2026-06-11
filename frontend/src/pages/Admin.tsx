import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Textbook, User, UserChangeRequestView } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getPendingUsers,
  getPendingTextbooks,
  approveUser,
  approveTextbook,
  getPendingUserChangeRequests,
  reviewUserChangeRequest,
} from '../services/adminService';
import { getTextbookImage } from '../lib/defaultImages';
import { StudentAccountManagePanel } from '../components/StudentAccountManagePanel';

export default function Admin() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 根据路由决定显示内容
  const isUsersPage = location.pathname === '/admin/users';
  const isTextbooksPage = location.pathname === '/admin' || location.pathname === '/admin/textbooks';

  const [pendingTextbooks, setPendingTextbooks] = useState<Textbook[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingChangeRequests, setPendingChangeRequests] = useState<UserChangeRequestView[]>([]);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [dataLoading, setDataLoading] = useState(false);

  // 审核不通过弹窗提示
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTargetType, setRejectTargetType] = useState<'user' | 'textbook' | 'changeRequest' | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // 检查用户是否已登录且是管理员
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('您没有权限访问此页面');
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // 加载数据
  const loadData = async () => {
    setDataLoading(true);
    try {
      if (isUsersPage) {
        const users = await getPendingUsers();
        const requests = await getPendingUserChangeRequests();
        setPendingUsers(users);
        setPendingChangeRequests(requests);
      } else {
        const textbooks = await getPendingTextbooks();
        setPendingTextbooks(textbooks);
      }
    } catch (error: any) {
      toast.error(error.message || '加载数据失败');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadData();
    }
  }, [isAuthenticated, user, isUsersPage]);

  // 处理教材审核
  const handleTextbookReview = async (textbookId: string, approved: boolean, reason?: string) => {
    try {
      await approveTextbook({ textbookId, approved, approvalReason: reason });
      toast.success(approved ? '教材审核通过' : '教材审核未通过');
      loadData();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  // 处理用户审核
  const handleUserReview = async (userId: string, approved: boolean, reason?: string) => {
    try {
      await approveUser({ userId, approved, rejectionReason: reason });
      toast.success(approved ? '用户审核通过' : '用户审核未通过');
      loadData();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  // 处理用户变更
  const handleChangeRequestReview = async (requestId: string, approved: boolean, reason?: string) => {
    try {
      await reviewUserChangeRequest({ requestId, approved, rejectionReason: reason });
      toast.success(approved ? '变更申请审核通过' : '变更申请审核未通过');
      loadData();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  // 审核不通过原因选项
  const textbookRejectReasons = [
    '其他',
    '照片未清晰展示封面 + 内页',
    '新旧程度与照片矛盾',
    '价格明显不合理',
    '信息填写不完整',
  ];

  const userRejectReasons = [
    '其他',
    '专业 / 年级填写与教务信息不符',
  ];

  // 审核不通过
  const openRejectModal = (type: 'user' | 'textbook' | 'changeRequest', id: string) => {
    setRejectTargetType(type);
    setRejectTargetId(id);

    const defaultReason = type === 'textbook' ? textbookRejectReasons[0] : userRejectReasons[0];
    setRejectReason(defaultReason);

    setShowRejectModal(true);
  };

  // 确认拒绝
  const handleConfirmReject = async () => {
    if (!rejectTargetType || !rejectTargetId) {
      return;
    }

    if (!rejectReason.trim()) {
      toast.error('请先选择或填写拒绝原因');
      return;
    }

    if (rejectTargetType === 'user') {
      await handleUserReview(rejectTargetId, false, rejectReason.trim());
    } else if (rejectTargetType === 'changeRequest') {
      await handleChangeRequestReview(rejectTargetId, false, rejectReason.trim());
    } else {
      await handleTextbookReview(rejectTargetId, false, rejectReason.trim());
    }

    setShowRejectModal(false);
    setRejectTargetId(null);
    setRejectTargetType(null);
    setRejectReason('');
  };

  const totalPendingUsers = pendingUsers.length;
  const totalPendingChangeRequests = pendingChangeRequests.length;
  const totalPending = totalPendingUsers + totalPendingChangeRequests;

  return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="flex-1">
          {/* 顶部头部 */}
          <div className="relative">
            {/* 顶部头部 */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-900 dark:to-gray-800"></div>

              <div className="relative pt-10 pb-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white/90 backdrop-blur">
                        <i className="fa-solid fa-shield-halved"></i>
                        <span>管理后台</span>
                      </div>

                      <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                        {isUsersPage ? '用户管理' : '教材审核'}
                      </h1>

                      <p className="mt-2 text-sm sm:text-base text-blue-100">
                        {isUsersPage
                            ? '审核注册/变更申请，并管理已通过的学生账号'
                            : '审核学生发布的教材信息，保障交易信息真实可靠'}
                      </p>
                    </div>

                    {/* 导航链接 */}
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center rounded-full bg-white/20 p-1 backdrop-blur">
                        <button
                            onClick={() => navigate('/admin/textbooks')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/70 ${
                                isTextbooksPage
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-white/90 hover:bg-white/10'
                            }`}
                        >
                          <i className="fa-solid fa-book"></i>
                          教材审核
                        </button>

                        <button
                            onClick={() => navigate('/admin/users')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/70 ${
                                isUsersPage
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-white/90 hover:bg-white/10'
                            }`}
                        >
                          <i className="fa-solid fa-users"></i>
                          用户管理
                        </button>

                        <button
                            onClick={() => navigate('/admin/logs')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/70 ${
                                location.pathname === '/admin/logs'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-white/90 hover:bg-white/10'
                            }`}
                        >
                          <i className="fa-solid fa-history"></i>
                          登录日志
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 头部 */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {isUsersPage ? (
                        <>
                          <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur ring-1 ring-white/10 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-white/80">注册申请</div>
                              <i className="fa-solid fa-user-plus text-white/80"></i>
                            </div>
                            <div className="mt-2 text-2xl font-extrabold">{totalPendingUsers}</div>
                            <div className="mt-1 text-xs text-white/70">待审核</div>
                          </div>

                          <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur ring-1 ring-white/10 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-white/80">信息变更</div>
                              <i className="fa-solid fa-pen-to-square text-white/80"></i>
                            </div>
                            <div className="mt-2 text-2xl font-extrabold">{totalPendingChangeRequests}</div>
                            <div className="mt-1 text-xs text-white/70">待审核</div>
                          </div>

                          <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur ring-1 ring-white/10 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-white/80">总待处理</div>
                              <i className="fa-solid fa-inbox text-white/80"></i>
                            </div>
                            <div className="mt-2 text-2xl font-extrabold">{totalPending}</div>
                            <div className="mt-1 text-xs text-white/70">待处理事项</div>
                          </div>
                        </>
                    ) : (
                        <>
                          <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur ring-1 ring-white/10 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-white/80">待审核教材</div>
                              <i className="fa-solid fa-book-open text-white/80"></i>
                            </div>
                            <div className="mt-2 text-2xl font-extrabold">{pendingTextbooks.length}</div>
                            <div className="mt-1 text-xs text-white/70">待处理</div>
                          </div>

                          <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur ring-1 ring-white/10 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-white/80">审核建议</div>
                              <i className="fa-solid fa-circle-info text-white/80"></i>
                            </div>
                            <div className="mt-2 text-sm font-semibold">优先核验图片与价格</div>
                            <div className="mt-1 text-xs text-white/70">减少信息不一致</div>
                          </div>

                          <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur ring-1 ring-white/10 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-white/80">快捷操作</div>
                              <i className="fa-solid fa-rotate-right text-white/80"></i>
                            </div>
                            <button
                                onClick={() => loadData()}
                                disabled={dataLoading}
                                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25 disabled:opacity-50"
                            >
                              <i className={`fa-solid ${dataLoading ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`}></i>
                              刷新数据
                            </button>
                          </div>
                        </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 内容区 */}
          <div className="relative pt-8 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6 ">
              {/* 教材审核 */}
              {!isUsersPage && (
                  <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700 overflow-hidden">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-gray-200/70 dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                          <i className="fa-solid fa-book"></i>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            待审核教材
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({pendingTextbooks.length} 件)
                        </span>
                          </h2>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            建议先查看图片与课程信息是否一致，再决定通过/拒绝。
                          </p>
                        </div>
                      </div>

                      <button
                          onClick={() => loadData()}
                          disabled={dataLoading}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200/70 hover:bg-blue-50 disabled:opacity-50 dark:bg-gray-800 dark:text-blue-200 dark:ring-gray-600 dark:hover:bg-gray-700"
                      >
                        <i className={`fa-solid ${dataLoading ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`}></i>
                        刷新
                      </button>
                    </div>

                    {pendingTextbooks.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200/80 dark:divide-gray-700">
                            <thead className="bg-blue-50/60 dark:bg-gray-700/50">
                            <tr>
                              <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200"
                              >
                                教材名称
                              </th>
                              <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200"
                              >
                                课程
                              </th>
                              <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200"
                              >
                                价格
                              </th>
                              <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200"
                              >
                                新旧程度
                              </th>
                              <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200"
                              >
                                发布者
                              </th>
                              <th
                                  scope="col"
                                  className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-200"
                              >
                                操作
                              </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {pendingTextbooks.map((textbook) => (
                                <tr key={textbook.id} className="hover:bg-blue-50/60 dark:hover:bg-gray-700/60 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                    {textbook.title}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {textbook.courseName} ({textbook.courseCode})
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {textbook.price === 0 ? '免费' : `¥${textbook.price}`}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {(() => {
                                      const cond = textbook.bookCondition || textbook.condition || '';
                                      return (
                                          <span
                                              className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                                                  cond === '95新'
                                                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                      : cond === '9新'
                                                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                          : cond === '8新'
                                                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                              : cond === '7新'
                                                                  ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                                                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                              }`}
                                          >
                                    {cond}
                                  </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {textbook.sellerName} ({textbook.sellerGrade}级 {textbook.sellerMajor})
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="inline-flex items-center justify-end gap-2">
                                      <button
                                          onClick={() => {
                                            setSelectedTextbook(textbook);
                                            setShowDetailModal(true);
                                          }}
                                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-200 dark:border-gray-600 dark:hover:bg-gray-700"
                                      >
                                        <i className="fa-solid fa-eye"></i>
                                        查看
                                      </button>
                                      <button
                                          onClick={() => handleTextbookReview(textbook.id, true)}
                                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                                      >
                                        <i className="fa-solid fa-check"></i>
                                        通过
                                      </button>
                                      <button
                                          onClick={() => openRejectModal('textbook', textbook.id)}
                                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:border-red-500/30 dark:hover:bg-red-900/20"
                                      >
                                        <i className="fa-solid fa-xmark"></i>
                                        拒绝
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>
                    ) : (
                        <div className="px-6 py-14 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                            <i className="fa-solid fa-circle-check text-xl"></i>
                          </div>
                          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">暂无待审核教材</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">所有教材已处理完毕</p>
                        </div>
                    )}
                  </div>
              )}

              {/* 用户管理 */}
              {isUsersPage && (
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700 overflow-hidden">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-gray-200/70 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                          <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">待处理事项</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              处理注册与信息变更申请；下方可对已通过审核的学生账号进行冻结/解冻/注销。
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                        <i className="fa-solid fa-inbox"></i>
                        {totalPending} 条待处理
                      </span>

                          <button
                              onClick={() => loadData()}
                              disabled={dataLoading}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200/70 hover:bg-blue-50 disabled:opacity-50 dark:bg-gray-800 dark:text-blue-200 dark:ring-gray-600 dark:hover:bg-gray-700"
                          >
                            <i className={`fa-solid ${dataLoading ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`}></i>
                            刷新
                          </button>
                        </div>
                      </div>

                      <div className="p-6">
                        {(pendingUsers.length > 0 || pendingChangeRequests.length > 0) ? (
                            <div className="grid grid-cols-1 gap-6">
                              {/* 注册申请 */}
                              <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                                <div className="flex items-start justify-between gap-4 px-5 py-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                                      <i className="fa-solid fa-user-plus"></i>
                                    </div>
                                    <div>
                                      <h3 className="text-base font-bold text-gray-900 dark:text-white">注册申请</h3>
                                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">新用户注册需管理员审核。</p>
                                    </div>
                                  </div>

                                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                              {pendingUsers.length} 件
                            </span>
                                </div>

                                {pendingUsers.length > 0 ? (
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200/80 dark:divide-gray-700">
                                        <thead className="bg-blue-50/60 dark:bg-gray-700/50">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            学号
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            姓名
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            专业
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            年级
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            联系电话
                                          </th>
                                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            操作
                                          </th>
                                        </tr>
                                        </thead>

                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                        {pendingUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-blue-50/60 dark:hover:bg-gray-700/60 transition-colors">
                                              <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                                                {u.studentId}
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                {u.name}
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                                {u.major}
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                          {u.grade}
                                        </span>
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-200">
                                                {u.phone}
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                                <div className="inline-flex items-center justify-end gap-2">
                                                  <button
                                                      onClick={() => handleUserReview(u.id, true)}
                                                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                                                  >
                                                    <i className="fa-solid fa-check"></i>
                                                    通过
                                                  </button>
                                                  <button
                                                      onClick={() => openRejectModal('user', u.id)}
                                                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:border-red-500/30 dark:hover:bg-red-900/20"
                                                  >
                                                    <i className="fa-solid fa-xmark"></i>
                                                    拒绝
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                      </table>
                                    </div>
                                ) : (
                                    <div className="px-5 py-10">
                                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200">
                                          <i className="fa-solid fa-circle-check"></i>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-gray-900 dark:text-white">暂无待审核注册申请</div>
                                          <div className="mt-1">新注册用户会在这里出现。</div>
                                        </div>
                                      </div>
                                    </div>
                                )}
                              </div>

                              {/* 信息变更申请 */}
                              <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                                <div className="flex items-start justify-between gap-4 px-5 py-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                                      <i className="fa-solid fa-pen-to-square"></i>
                                    </div>
                                    <div>
                                      <h3 className="text-base font-bold text-gray-900 dark:text-white">信息变更申请</h3>
                                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">用户提交资料修改需审核。</p>
                                    </div>
                                  </div>

                                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                              {pendingChangeRequests.length} 件
                            </span>
                                </div>

                                {pendingChangeRequests.length > 0 ? (
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200/80 dark:divide-gray-700">
                                        <thead className="bg-blue-50/60 dark:bg-gray-700/50">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            学号
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            姓名
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            变更字段
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            原值
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            新值
                                          </th>
                                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-200">
                                            操作
                                          </th>
                                        </tr>
                                        </thead>

                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                        {pendingChangeRequests.map((request) => {
                                          const r = request as any;
                                          const requestId: string =
                                              r.id ?? r.requestId ?? r.changeRequestId ?? r._id;

                                          const studentId = r.studentId ?? r.studentNo ?? r.stuId ?? '';
                                          const name = r.name ?? r.realName ?? r.userName ?? '';
                                          let fieldLabel =
                                              r.fieldLabel ?? r.fieldName ?? r.field ?? r.changeField ?? '';
                                          let oldValue =
                                              r.oldValue ?? r.beforeValue ?? r.originValue ?? '';
                                          let newValue =
                                              r.newValue ?? r.afterValue ?? r.targetValue ?? '';

                                          if ((!fieldLabel || fieldLabel.trim() === '') && (!oldValue || oldValue === '') && (!newValue || newValue === '')) {
                                            const changes: Array<{ label: string; oldVal: string; newVal: string }> = [];

                                            // 手机号
                                            if (r.newPhone != null && String(r.newPhone).trim() !== '') {
                                              changes.push({
                                                label: '手机号',
                                                oldVal: r.currentPhone ?? '',
                                                newVal: r.newPhone ?? '',
                                              });
                                            }

                                            // 专业
                                            if (r.newMajor != null && String(r.newMajor).trim() !== '') {
                                              changes.push({
                                                label: '专业',
                                                oldVal: r.currentMajor ?? '',
                                                newVal: r.newMajor ?? '',
                                              });
                                            }

                                            // 年级
                                            if (r.newGrade != null && String(r.newGrade).trim() !== '') {
                                              changes.push({
                                                label: '年级',
                                                oldVal: r.currentGrade ?? '',
                                                newVal: r.newGrade ?? '',
                                              });
                                            }

                                            // 密码
                                            if (r.passwordChanged === true) {
                                              changes.push({
                                                label: '密码',
                                                oldVal: '*',
                                                newVal: '*',
                                              });
                                            }

                                            if (changes.length > 0) {
                                              fieldLabel = changes.map((c) => c.label).join('；');
                                              oldValue = changes.map((c) => c.oldVal).join('；');
                                              newValue = changes.map((c) => c.newVal).join('；');
                                            }
                                          }

                                          return (
                                              <tr key={requestId} className="hover:bg-blue-50/60 dark:hover:bg-gray-700/60 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                                                  {studentId}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                  {name}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 max-w-[12rem] truncate"
                                                    title={fieldLabel}
                                                >
                                                  {fieldLabel}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 max-w-[12rem] truncate"
                                                    title={oldValue}
                                                >
                                                  {oldValue}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 max-w-[12rem] truncate"
                                                    title={newValue}
                                                >
                                                  {newValue}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                                  <div className="inline-flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleChangeRequestReview(requestId, true)}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                                                    >
                                                      <i className="fa-solid fa-check"></i>
                                                      通过
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal('changeRequest', requestId)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:border-red-500/30 dark:hover:bg-red-900/20"
                                                    >
                                                      <i className="fa-solid fa-xmark"></i>
                                                      拒绝
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                          );
                                        })}
                                        </tbody>
                                      </table>
                                    </div>
                                ) : (
                                    <div className="px-5 py-10">
                                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200">
                                          <i className="fa-solid fa-circle-check"></i>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-gray-900 dark:text-white">暂无待审核信息变更申请</div>
                                          <div className="mt-1">用户提交的变更会在这里出现。</div>
                                        </div>
                                      </div>
                                    </div>
                                )}
                              </div>
                            </div>
                        ) : (
                            <div className="py-14 text-center">
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                                <i className="fa-solid fa-circle-check text-xl"></i>
                              </div>
                              <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                                暂无待审核用户
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                所有用户相关申请已处理完毕
                              </p>
                            </div>
                        )}
                      </div>
                    </div>

                    <StudentAccountManagePanel />
                  </div>
              )}

            </div>
          </div>
        </main>

        {/* 教材详情 */}
        {showDetailModal && selectedTextbook && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ring-1 ring-gray-200/70 dark:ring-gray-700">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      教材详情
                    </h3>
                    <button
                        onClick={() => setShowDetailModal(false)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>

                  {/* 图片展示 */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">教材图片</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedTextbook.images && selectedTextbook.images.length > 0 ? (
                          selectedTextbook.images.map((img, index) => (
                              <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden ring-1 ring-gray-200/70 dark:ring-gray-700">
                                <img
                                    src={img.startsWith('http') ? img : `http://localhost:8085${img}`}
                                    alt={`${selectedTextbook.title} - 图片${index + 1}`}
                                    className="w-full h-full object-contain bg-white dark:bg-gray-600"
                                />
                              </div>
                          ))
                      ) : (
                          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden ring-1 ring-gray-200/70 dark:ring-gray-700">
                            <img
                                src={getTextbookImage(selectedTextbook.images, selectedTextbook.id)}
                                alt={selectedTextbook.title}
                                className="w-full h-full object-contain bg-white dark:bg-gray-600"
                            />
                          </div>
                      )}
                    </div>
                  </div>

                  {/* 基本信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">基本信息</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">书名：</span>{selectedTextbook.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">作者：</span>{selectedTextbook.author}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">课程：</span>{selectedTextbook.courseName} ({selectedTextbook.courseCode})
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">适用专业：</span>{selectedTextbook.applicableMajor}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">价格：</span>
                          <span className={selectedTextbook.price === 0 ? 'text-green-600 dark:text-green-400 font-bold' : 'text-blue-600 dark:text-blue-400 font-bold'}>
                        {selectedTextbook.price === 0 ? '免费' : `¥${selectedTextbook.price}`}
                      </span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">新旧程度：</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              (selectedTextbook.bookCondition || selectedTextbook.condition) === '95新' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                  (selectedTextbook.bookCondition || selectedTextbook.condition) === '9新' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                      (selectedTextbook.bookCondition || selectedTextbook.condition) === '8新' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                          (selectedTextbook.bookCondition || selectedTextbook.condition) === '7新' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                                              'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                        {selectedTextbook.bookCondition || selectedTextbook.condition}
                      </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">发布者信息</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">姓名：</span>{selectedTextbook.sellerName}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">年级：</span>{selectedTextbook.sellerGrade}级
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">专业：</span>{selectedTextbook.sellerMajor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 备注信息 */}
                  {selectedTextbook.notes && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">备注信息</h4>
                        <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl ring-1 ring-gray-200/70 dark:ring-gray-700">
                          {selectedTextbook.notes}
                        </p>
                      </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setShowDetailModal(false)}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    >
                      关闭
                    </button>
                    <button
                        onClick={() => {
                          if (selectedTextbook) {
                            openRejectModal('textbook', selectedTextbook.id);
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:border-red-500/30 dark:hover:bg-red-900/20"
                    >
                      <i className="fa-solid fa-xmark"></i>
                      拒绝
                    </button>
                    <button
                        onClick={() => {
                          if (selectedTextbook) {
                            handleTextbookReview(selectedTextbook.id, true);
                            setShowDetailModal(false);
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      <i className="fa-solid fa-check"></i>
                      通过
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* 审核拒绝原因弹窗 */}
        {showRejectModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full ring-1 ring-gray-200/70 dark:ring-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">审核不通过</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          请选择或填写本次审核不通过的原因。
                        </p>
                      </div>
                    </div>

                    <button
                        onClick={() => {
                          setShowRejectModal(false);
                          setRejectTargetId(null);
                          setRejectTargetType(null);
                          setRejectReason('');
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                        aria-label="关闭"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        常用原因
                      </label>
                      <select
                          className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                      >
                        {(rejectTargetType === 'textbook' ? textbookRejectReasons : userRejectReasons).map((reason) => (
                            <option key={reason} value={reason}>
                              {reason}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        详细说明（可选）
                      </label>
                      <textarea
                          className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                          rows={3}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="可以在这里补充更详细的说明"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => {
                          setShowRejectModal(false);
                          setRejectTargetId(null);
                          setRejectTargetType(null);
                          setRejectReason('');
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      取消
                    </button>
                    <button
                        onClick={handleConfirmReject}
                        className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                    >
                      确认拒绝
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        <Footer />
      </div>
  );
}
