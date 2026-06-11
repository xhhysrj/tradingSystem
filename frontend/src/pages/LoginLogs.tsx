  import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {batchDeleteLoginLogs, deleteLoginLog, getLoginLogs} from '../services/loginLogService';
import type { LoginLog } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import {ConfirmModal} from "@/components/ConfirmModal.tsx";

export default function LoginLogs() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // 检查权限
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('需要管理员权限');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // 加载日志列表
  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await getLoginLogs({
        page,
        pageSize
      });
      setLogs(result.list);
      setTotal(result.total);
    } catch (error: any) {
      toast.error(error.message || '加载日志失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    const all = new Set<string>();
    logs.forEach(l => all.add(l.id));
    setSelectedIds(all);
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };


  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadLogs();
    }
  }, [page, isAuthenticated, user]);

  // 格式化时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 分页
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">登录日志</h1>

          {/* 统计信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              共 {total} 条记录，当前第 {page} / {totalPages} 页
            </div>
          </div>

          {selectedIds.size > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setPendingDeleteId('batch')}
                    className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 text-sm"
                >
                  批量删除
                </button>
              </div>
          )}

          {/* 日志列表 */}
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
              <i className="fa-solid fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
              <p className="text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3">
                        <input
                            type="checkbox"
                            checked={logs.length > 0 && selectedIds.size === logs.length}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        学号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        姓名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        角色
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        登录时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        失败原因
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <input
                              type="checkbox"
                              checked={selectedIds.has(log.id)}
                              onChange={(e) => toggleSelectOne(log.id, e.target.checked)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.studentId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.userName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.userRole === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}>
                            {log.userRole === 'admin' ? '管理员' : '学生'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(log.loginTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.loginStatus === 'success'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {log.loginStatus === 'success' ? '成功' : '失败'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {log.failureReason || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                              onClick={() => setPendingDeleteId(log.id)}
                              className="px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 text-sm"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        显示第 <span className="font-medium">{(page - 1) * pageSize + 1}</span> 到{' '}
                        <span className="font-medium">{Math.min(page * pageSize, total)}</span> 条，共{' '}
                        <span className="font-medium">{total}</span> 条
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pageNum
                                  ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          <i className="fa-solid fa-chevron-right"></i>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
              <i className="fa-solid fa-inbox text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-600 dark:text-gray-400">暂无登录日志</p>
            </div>
          )}
        </div>
        {pendingDeleteId && (
            <ConfirmModal
                title="删除确认"
                message={
                  pendingDeleteId === 'batch'
                      ? `确定删除已勾选的 ${selectedIds.size} 条日志吗？`
                      : '确定删除这条日志吗？'
                }
                onCancel={() => setPendingDeleteId(null)}
                onConfirm={async () => {
                  try {
                    if (pendingDeleteId === 'batch') {
                      // 批量删除
                      await batchDeleteLoginLogs(Array.from(selectedIds));
                      toast.success('批量删除成功');
                      setSelectedIds(new Set());   // 清空勾选
                    } else {
                      // 单条删除
                      await deleteLoginLog(pendingDeleteId);
                      toast.success('删除成功');
                      setSelectedIds(prev => {
                        const next = new Set(prev);
                        next.delete(pendingDeleteId);
                        return next;
                      });
                    }
                    setPendingDeleteId(null);
                    loadLogs();                      // 重新拉取列表
                  } catch (e: any) {
                    toast.error(e.message || '删除失败');
                  }
                }}
            />
        )}
      </main>
      <Footer />
    </div>
  );
}
