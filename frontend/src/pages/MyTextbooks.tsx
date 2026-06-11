import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { deleteTextbook, getMyTextbooks } from '../services/textbookService';
import type { Textbook } from '../types';
import { getTextbookImage } from '../lib/defaultImages';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'sold';

export default function MyTextbooks() {
    const [loading, setLoading] = useState(false);
    const [textbooks, setTextbooks] = useState<Textbook[]>([]);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        getMyTextbooks()
            .then((list) => {
                if (!mounted) return;
                setTextbooks(Array.isArray(list) ? list : []);
            })
            .catch((e: any) => {
                toast.error(e?.message || '获取我发布的教材失败');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        if (statusFilter === 'all') return textbooks;
        return textbooks.filter((t) => (t.status as any) === statusFilter);
    }, [textbooks, statusFilter]);

    const stats = useMemo(() => {
        const total = textbooks.length;
        const pending = textbooks.filter((t) => (t.status as any) === 'pending').length;
        const approved = textbooks.filter((t) => (t.status as any) === 'approved').length;
        const rejected = textbooks.filter((t) => (t.status as any) === 'rejected').length;
        const sold = textbooks.filter((t) => (t.status as any) === 'sold').length;

        return { total, pending, approved, rejected, sold };
    }, [textbooks]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    text: '审核中',
                    color:
                        'bg-blue-50 text-blue-700 ring-1 ring-blue-200/70 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800/60',
                    dot: 'bg-blue-500',
                };
            case 'approved':
                return {
                    text: '已通过',
                    color:
                        'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70 dark:bg-indigo-900/30 dark:text-indigo-200 dark:ring-indigo-800/60',
                    dot: 'bg-indigo-500',
                };
            case 'rejected':
                return {
                    text: '被拒绝',
                    color:
                        'bg-red-50 text-red-700 ring-1 ring-red-200/70 dark:bg-red-900/25 dark:text-red-200 dark:ring-red-800/50',
                    dot: 'bg-red-500',
                };
            case 'sold':
                return {
                    text: '已售出',
                    color:
                        'bg-gray-50 text-gray-700 ring-1 ring-gray-200/70 dark:bg-gray-700/40 dark:text-gray-200 dark:ring-gray-600/60',
                    dot: 'bg-gray-400',
                };
            default:
                return {
                    text: '未知',
                    color:
                        'bg-gray-50 text-gray-700 ring-1 ring-gray-200/70 dark:bg-gray-700/40 dark:text-gray-200 dark:ring-gray-600/60',
                    dot: 'bg-gray-400',
                };
        }
    };

    const formatTime = (v?: string) => {
        if (!v) return '—';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return v;
        return d.toLocaleString('zh-CN');
    };

    const handleDelete = (t: Textbook) => {
        const tip =
            t.status === 'pending'
                ? '该教材正在审核中，删除将撤销发布，确定删除吗？'
                : t.status === 'approved'
                    ? '该教材已上架，删除后将从系统下架，确定删除吗？'
                    : t.status === 'rejected'
                        ? '该教材审核未通过，确定删除吗？'
                        : t.status === 'sold'
                            ? '该教材已售出，删除不会影响订单记录，确定删除吗？'
                            : '确定删除这条教材吗？';

        const id = toast(tip, {
            action: {
                label: '确定',
                onClick: async () => {
                    toast.dismiss(id);

                    try {
                        await deleteTextbook(t.id);
                        setTextbooks((list) => list.filter((x) => x.id !== t.id));
                        toast.success('删除成功');
                    } catch (e: any) {
                        toast.error(e?.message || '删除失败');
                    }
                },
            },
            cancel: {
                label: '取消',
                onClick: () => toast.dismiss(id),
            },
        });
    };

    const statusTabs: Array<{ key: StatusFilter; label: string; count: number }> = [
        { key: 'all', label: '全部', count: stats.total },
        { key: 'pending', label: '审核中', count: stats.pending },
        { key: 'approved', label: '已通过', count: stats.approved },
        { key: 'rejected', label: '被拒绝', count: stats.rejected },
        { key: 'sold', label: '已售出', count: stats.sold },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar />
                <main className="flex-grow w-full">
                    {/* 头部区域 */}
                    <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto mt-8 flex flex-wrap items-center justify-between gap-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            我的发布
                        </h1>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Link
                                to="/post"
                                className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 w-full
border border-blue-600 text-blue-600 font-medium shadow-sm
hover:bg-blue-50 dark:hover:bg-gray-800"
                            >
                                <i className="fa-solid fa-plus"></i>
                                发布新教材
                            </Link>
                        </div>
                    </div>



                {/* 内容区 */}
                <section className="relative pt-5 pb-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* 筛选栏 */}
                        <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700 overflow-hidden">
                            <div className="px-5 py-4 sm:px-6 sm:py-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                                            <i className="fa-solid fa-filter"></i>
                                        </div>
                                        <div>
                                            <div className="text-base font-bold text-gray-900 dark:text-white">筛选</div>
                                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                按审核状态查看你的发布记录
                                            </div>
                                        </div>
                                    </div>

                                    {/* 移动端*/}
                                    <div className="sm:hidden">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                        >
                                            <option value="all">全部</option>
                                            <option value="pending">审核中</option>
                                            <option value="approved">已通过</option>
                                            <option value="rejected">被拒绝</option>
                                            <option value="sold">已售出</option>
                                        </select>
                                    </div>

                                    {/* 桌面端*/}
                                    <div className="hidden sm:flex items-center gap-2 flex-wrap">
                                        <div className="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-700/40 p-1 ring-1 ring-gray-200/70 dark:ring-gray-700">
                                            {statusTabs.map((tab) => {
                                                const active = statusFilter === tab.key;
                                                return (
                                                    <button
                                                        key={tab.key}
                                                        type="button"
                                                        onClick={() => setStatusFilter(tab.key)}
                                                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                                                            active
                                                                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200/70 dark:bg-gray-800 dark:text-blue-200 dark:ring-gray-600'
                                                                : 'text-gray-600 hover:bg-white/70 dark:text-gray-200/80 dark:hover:bg-gray-800/40'
                                                        }`}
                                                    >
                                                        <span>{tab.label}</span>
                                                        <span
                                                            className={`inline-flex items-center justify-center min-w-[1.75rem] h-6 px-2 rounded-full text-xs font-bold ${
                                                                active
                                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                                                                    : 'bg-gray-200/70 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                                            }`}
                                                        >
                              {tab.count}
                            </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 列表区域 */}
                        <div className="mt-6">
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700 p-5"
                                        >
                                            <div className="animate-pulse">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                    <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="h-4 w-2/5 rounded bg-gray-200 dark:bg-gray-700"></div>
                                                </div>
                                                <div className="mt-5 flex gap-3">
                                                    <div className="h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="h-10 w-24 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700 p-8 sm:p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                                        <i className="fa-solid fa-inbox text-xl"></i>
                                    </div>
                                    <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                                        暂无符合该条件的发布记录
                                    </h3>
                                    <Link
                                        to="/post"
                                        className="inline-flex items-center justify-center gap-2 mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-sm"
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                        去发布教材
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filtered.map((t) => {
                                        const statusInfo = getStatusInfo(t.status as any);
                                        const timeLabel = (t.status as any) === 'approved' ? '发布时间' : '提交时间';
                                        const coverUrl = getTextbookImage(t.images, t.id);

                                        return (
                                            <div
                                                key={t.id}
                                                className="group rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700 p-5 hover:shadow-md transition-shadow relative"
                                            >
                                                {/* 标题行 */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">
                                                            {t.title}
                                                        </h3>
                                                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <span className="inline-flex items-center gap-2">
                                <i className="fa-solid fa-book text-blue-600/80 dark:text-blue-300"></i>
                                <span className="truncate">
                                  {t.courseName}（{t.courseCode}）
                                </span>
                              </span>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${statusInfo.color}`}
                                                    >
                            <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                                                        {statusInfo.text}
                          </span>
                                                </div>

                                                {/* 信息区 */}
                                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-200">
                                                    <div className="flex items-start gap-2">
                                                        <i className="fa-solid fa-graduation-cap mt-0.5 text-blue-600/80 dark:text-blue-300"></i>
                                                        <div className="min-w-0">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">适用专业</div>
                                                            <div className="font-semibold truncate">{t.applicableMajor}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <i className="fa-solid fa-tag mt-0.5 text-blue-600/80 dark:text-blue-300"></i>
                                                        <div className="min-w-0">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">价格</div>
                                                            <div className="font-extrabold text-blue-700 dark:text-blue-200">
                                                                {t.price === 0 ? '免费' : `¥${t.price}`}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2 sm:col-span-2">
                                                        <i className="fa-regular fa-clock mt-0.5 text-blue-600/80 dark:text-blue-300"></i>
                                                        <div className="min-w-0">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{timeLabel}</div>
                                                            <div className="font-semibold">{formatTime(t.publishTime)}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 驳回原因 */}
                                                {(t.status as any) === 'rejected' && t.approvalReason && (
                                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                                                        <div className="flex items-start gap-2">
                                                            <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
                                                            <div>
                                                                <div className="font-bold">驳回原因</div>
                                                                <div className="mt-1 leading-relaxed">{t.approvalReason}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 操作区 */}
                                                <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                    <Link
                                                        to={`/textbook/${t.id}`}
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold shadow-sm"
                                                    >
                                                        <i className="fa-solid fa-eye"></i>
                                                        查看详情
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(t)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:border-red-500/30 dark:hover:bg-red-900/20"
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                        删除
                                                    </button>

                                                    <div className="hidden sm:block flex-1" />

                                                </div>
                                                <div className="pointer-events-none absolute bottom-5 right-5 w-20 h-28 sm:w-24 sm:h-32">
                                                    <img
                                                        src={coverUrl}
                                                        alt={`${t.title} 封面`}
                                                        className="h-full w-full object-cover rounded-lg ring-1 ring-black/5 dark:ring-white/10 shadow-sm"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}