import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    deleteUser,
    getApprovedStudents,
    updateUserStatus,
    type StudentAccount,
} from '../services/adminService';

/**
 * 学生账号管理（冻结/解冻、注销）
 * 仅展示已审核通过(approval_status=approved)的学生,不展示当前登录用户
 */
export function StudentAccountManagePanel() {
    const [loading, setLoading] = useState(false);

    const [list, setList] = useState<StudentAccount[]>([]);
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [deleting, setDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<StudentAccount | null>(null);

    const totalPages = useMemo(() => {
        const pages = Math.ceil(total / pageSize);
        return pages <= 0 ? 1 : pages;
    }, [total, pageSize]);

    const load = async (p = page, ps = pageSize) => {
        setLoading(true);
        try {
            const res = await getApprovedStudents(p, ps);
            setList(res.list || []);
            setTotal(res.total || 0);
            setPage(res.page || p);
            setPageSize(res.pageSize || ps);
        } catch (error: any) {
            toast.error(error?.message || '加载学生列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(page, pageSize);
    }, [page, pageSize]);

    const renderRole = (role: string) => {
        if (role === 'student') return '学生';
        if (role === 'admin') return '管理员';
        return role || '-';
    };

    const renderStatus = (status: string) => {
        if (status === 'normal') return '正常';
        if (status === 'frozen') return '冻结';
        return status || '-';
    };

    const handleToggleFreeze = async (u: StudentAccount) => {
        const nextStatus = u.status === 'frozen' ? 'normal' : 'frozen';
        try {
            await updateUserStatus({ userId: u.id, status: nextStatus });
            toast.success(nextStatus === 'frozen' ? '已冻结' : '已解冻');
            load(page, pageSize);
        } catch (error: any) {
            toast.error(error?.message || '操作失败');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            await deleteUser(deleteTarget.id);
            toast.success('注销成功');
            setDeleteTarget(null);

            // 当前页被删到空，回退一页
            const nextTotal = Math.max(0, total - 1);
            const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
            const nextPage = Math.min(page, nextTotalPages);
            setPage(nextPage);
            await load(nextPage, pageSize);
        } catch (error: any) {
            toast.error(error?.message || '注销失败');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700 overflow-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-gray-200/70 dark:border-gray-700">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                        <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            学生账号管理
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            仅展示已审核通过的学生账号，可进行冻结/解冻/注销。
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                        <i className="fa-solid fa-database"></i>
                        共 {total} 条
                    </span>

                    <button
                        onClick={() => load(page, pageSize)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200/70 hover:bg-blue-50 disabled:opacity-50 dark:bg-gray-800 dark:text-blue-200 dark:ring-gray-600 dark:hover:bg-gray-700"
                    >
                        <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`}></i>
                        刷新
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200/80 dark:divide-gray-700">
                        <thead className="bg-blue-50/60 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                姓名
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                学号
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                手机号
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                专业
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                年级
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                角色
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                状态
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-200">
                                操作
                            </th>
                        </tr>
                        </thead>

                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td
                                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                    colSpan={8}
                                >
                                    加载中...
                                </td>
                            </tr>
                        ) : list.length === 0 ? (
                            <tr>
                                <td
                                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                    colSpan={8}
                                >
                                    暂无数据
                                </td>
                            </tr>
                        ) : (
                            list.map((u) => (
                                <tr
                                    key={u.id}
                                    className="hover:bg-blue-50/60 dark:hover:bg-gray-700/60 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {u.name || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {u.studentId || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {u.phone || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {u.major || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {u.grade || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {renderRole(u.role)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {renderStatus(u.status)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <button
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                onClick={() => handleToggleFreeze(u)}
                                            >
                                                {u.status === 'frozen' ? '解冻' : '冻结'}
                                            </button>

                                            <button
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                onClick={() => setDeleteTarget(u)}
                                            >
                                                注销
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 分页 */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        第 {page} / {totalPages} 页
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            上一页
                        </button>
                        <button
                            className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            下一页
                        </button>
                    </div>
                </div>
            </div>

            {/* 注销确认弹窗 */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            确认注销
                        </h3>

                        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                            <p>
                                你确定要注销该学生账号吗？该操作不可恢复。
                            </p>
                            <p>
                                <span className="font-medium">姓名：</span>{deleteTarget.name || '-'}
                            </p>
                            <p>
                                <span className="font-medium">学号：</span>{deleteTarget.studentId || '-'}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                disabled={deleting}
                                onClick={() => setDeleteTarget(null)}
                            >
                                取消
                            </button>

                            <button
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                disabled={deleting}
                                onClick={handleConfirmDelete}
                            >
                                {deleting ? '处理中...' : '确认注销'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );


}