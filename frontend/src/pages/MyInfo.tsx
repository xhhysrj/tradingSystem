import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser } from '../services/authService';
import { getMyLatestChangeRequest, submitChangeRequest } from '../services/userService';
import type { User, UserChangeRequest } from '../types';

export default function MyInfo() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [latestRequest, setLatestRequest] = useState<UserChangeRequest | null>(null);

    const [phone, setPhone] = useState('');
    const [major, setMajor] = useState('');
    const [grade, setGrade] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const loadData = async () => {
        try {
            const user = await getCurrentUser();
            setUserInfo(user);

            setPhone(user.phone || '');
            setMajor(user.major || '');
            setGrade(user.grade || '');

            const req = await getMyLatestChangeRequest();
            setLatestRequest(req);
        } catch (error) {
            console.error('加载我的信息失败:', error);
            toast.error('加载失败，请重新登录后再试');
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadData();
    }, [isAuthenticated, navigate]);

    const handleSubmit = async () => {
        if (!userInfo) return;

        if (newPassword && newPassword.trim().length < 6) {
            toast.error('密码长度不能少于6位');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            toast.error('两次输入的密码不一致');
            return;
        }

        setLoading(true);
        try {
            await submitChangeRequest({
                phone,
                major,
                grade,
                newPassword: newPassword || undefined,
                confirmPassword: confirmPassword || undefined,
            });
            toast.success('已提交变更申请，请等待管理员审核');
            setNewPassword('');
            setConfirmPassword('');
            await loadData();
        } catch (error: any) {
            console.error('提交变更申请失败:', error);
            toast.error(error?.message || '提交失败，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    const renderRequestStatus = () => {
        if (!latestRequest) return null;

        if (latestRequest.status === 'pending') {
            return (
                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                    你有一条<strong className="mx-1">待审核</strong>的变更申请，管理员审核通过后信息才会生效。
                    <div className="mt-1 text-xs opacity-80">如需调整内容，可直接再次提交（会覆盖本次待审核申请）。</div>
                </div>
            );
        }

        if (latestRequest.status === 'rejected') {
            return (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                    你上一条变更申请已被<strong className="mx-1">驳回</strong>。
                    {latestRequest.rejectionReason ? (
                        <div className="mt-1 text-xs opacity-80">原因：{latestRequest.rejectionReason}</div>
                    ) : null}
                </div>
            );
        }

        if (latestRequest.status === 'approved') {
            return (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200">
                    你上一条变更申请已<strong className="mx-1">通过</strong>，信息已更新。
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="pt-20 pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">我的信息</h1>
                    </div>

                    {renderRequestStatus()}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">学号</label>
                                <input
                                    type="text"
                                    value={userInfo?.studentId || ''}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓名</label>
                                <input
                                    type="text"
                                    value={userInfo?.name || ''}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">手机号</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="请输入手机号"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">专业</label>
                                <input
                                    type="text"
                                    value={major}
                                    onChange={(e) => setMajor(e.target.value)}
                                    placeholder="请输入专业"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">年级</label>
                                <select
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">请选择年级</option>
                                    {Array.from({ length: 6 }).map((_, idx) => {
                                        const y = new Date().getFullYear() - idx;
                                        return (
                                            <option key={y} value={String(y)}>
                                                {y}级
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">修改密码</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">如不修改密码请留空</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">新密码</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="请输入新密码"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">确认新密码</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="请再次输入新密码"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50"
                            >
                                {loading ? '提交中...' : '提交审核'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}