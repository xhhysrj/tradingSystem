import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Textbook } from '../types';
import { getTextbookImage } from '../lib/defaultImages';
import { cn } from '../lib/utils';

interface LatestReleaseSliderProps {
    textbooks: Textbook[];
}


export function LatestReleaseSlider({ textbooks }: LatestReleaseSliderProps) {
    const total = textbooks?.length || 0;
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (active > total - 1) setActive(0);
    }, [total, active]);

    const current = useMemo(() => {
        if (!total) return null;
        return textbooks[active];
    }, [textbooks, active, total]);

    const canSwitch = total > 1;

    const goPrev = () => {
        if (!canSwitch) return;
        setActive((i) => (i - 1 + total) % total);
    };

    const goNext = () => {
        if (!canSwitch) return;
        setActive((i) => (i + 1) % total);
    };

    return (
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-gray-200/70 dark:ring-gray-700">

            <div className="absolute inset-0 bg-gradient-to-r from-rose-50 via-white to-sky-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
            <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-500/10" />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />


            <div className="relative px-20 py-10 sm:px-24 sm:py-14">

                <button
                    type="button"
                    aria-label="上一条"
                    onClick={goPrev}
                    disabled={!canSwitch}
                    className={cn(
                        'absolute left-5 top-1/2 z-10 -translate-y-1/2',
                        'h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/80 backdrop-blur',
                        'shadow-md ring-1 ring-gray-200/70 dark:ring-gray-700',
                        'flex items-center justify-center text-gray-700 dark:text-gray-200',
                        'hover:bg-white dark:hover:bg-gray-800',
                        'disabled:opacity-30 disabled:cursor-not-allowed'
                    )}
                >
                    <i className="fa-solid fa-chevron-left text-sm"></i>
                </button>

                <button
                    type="button"
                    aria-label="下一条"
                    onClick={goNext}
                    disabled={!canSwitch}
                    className={cn(
                        'absolute right-5 top-1/2 z-10 -translate-y-1/2',
                        'h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/80 backdrop-blur',
                        'shadow-md ring-1 ring-gray-200/70 dark:ring-gray-700',
                        'flex items-center justify-center text-gray-700 dark:text-gray-200',
                        'hover:bg-white dark:hover:bg-gray-800',
                        'disabled:opacity-30 disabled:cursor-not-allowed'
                    )}
                >
                    <i className="fa-solid fa-chevron-right text-sm"></i>
                </button>

                <AnimatePresence mode="wait">
                    {current ? (
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, x: 28 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -28 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10"
                        >

                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-gray-800/70 px-4 py-1.5 text-xs font-extrabold tracking-widest text-gray-800 dark:text-gray-100 ring-1 ring-gray-200/70 dark:ring-gray-700">
                                    精选教材
                                    <span className="opacity-70">{total > 0 ? `${active + 1}/${total}` : ''}</span>
                                </div>

                                <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    {current.title}
                                </h2>

                                <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                    课程：{current.courseName}（{current.courseCode}）<br />
                                    适用专业：{current.applicableMajor}<br />
                                    作者：{current.author || '—'}
                                </p>

                                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span
                      className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-sm font-bold',
                          (current.bookCondition || current.condition) === '95新'
                              ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300'
                              : (current.bookCondition || current.condition) === '9新'
                                  ? 'bg-blue-600/10 text-blue-700 dark:text-blue-300'
                                  : 'bg-gray-900/5 text-gray-700 dark:text-gray-200'
                      )}
                  >
                    {(current.bookCondition || current.condition) || '成色未知'}
                  </span>

                                    <span className="inline-flex items-center rounded-full bg-gray-900/5 dark:bg-white/10 px-3 py-1 text-sm font-bold text-gray-800 dark:text-gray-100">
                    {current.price === 0 ? '免费' : `¥${current.price}`}
                  </span>
                                </div>

                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                                    <Link
                                        to={`/textbook/${current.id}`}
                                        className={cn(
                                            'inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-bold',
                                            'bg-gray-900 text-white hover:bg-gray-800',
                                            'dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100',
                                            'transition-colors'
                                        )}
                                    >
                                        查看详情 <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
                                    </Link>

                                    <Link
                                        to="/textbooks"
                                        className={cn(
                                            'inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-bold',
                                            'bg-white/70 hover:bg-white text-gray-900 ring-1 ring-gray-200/70',
                                            'dark:bg-gray-800/60 dark:hover:bg-gray-800 dark:text-gray-100 dark:ring-gray-700',
                                            'transition-colors'
                                        )}
                                    >
                                        浏览更多
                                    </Link>
                                </div>
                            </div>


                            <div className="flex justify-center lg:justify-end">
                                <div className="relative">
                                    <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-gray-900/5 dark:bg-white/5" />
                                    <div className="relative rounded-3xl bg-white/80 dark:bg-gray-800/70 backdrop-blur p-6 shadow-xl ring-1 ring-gray-200/70 dark:ring-gray-700">
                                        <img
                                            src={getTextbookImage(current.images, current.id)}
                                            alt={current.title}
                                            className="h-72 w-56 sm:h-80 sm:w-64 object-contain"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-16 text-center text-gray-600 dark:text-gray-300"
                        >
                            暂无教材
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 指示点 */}
                {total > 1 ? (
                    <div className="mt-10 flex items-center justify-center gap-2">
                        {textbooks.map((t, idx) => (
                            <button
                                key={t.id}
                                type="button"
                                aria-label={`切换到第 ${idx + 1} 条`}
                                onClick={() => setActive(idx)}
                                className={cn(
                                    'h-2.5 w-2.5 rounded-full transition-all',
                                    idx === active
                                        ? 'bg-gray-900 dark:bg-white w-6'
                                        : 'bg-gray-400/60 dark:bg-gray-600 hover:bg-gray-500/80 dark:hover:bg-gray-500'
                                )}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}