import { Link } from 'react-router-dom';
import { Textbook } from '../types';
import { getTextbookImage } from '../lib/defaultImages';
import { cn } from '../lib/utils';

interface TextbookShowcaseCardProps {
    textbook: Textbook;
    className?: string;
    forceFree?: boolean;
}

function getConditionStyle(cond: string) {
    switch (cond) {
        case '95新':
            return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800/60';
        case '9新':
            return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/70 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800/60';
        case '8新':
            return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800/60';
        case '7新':
            return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/70 dark:bg-orange-900/30 dark:text-orange-200 dark:ring-orange-800/60';
        default:
            return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200/70 dark:bg-gray-700/40 dark:text-gray-200 dark:ring-gray-600/60';
    }
}

export function TextbookShowcaseCard({ textbook, className, forceFree }: TextbookShowcaseCardProps) {
    const condition = textbook.bookCondition || textbook.condition || '';
    const imageUrl = getTextbookImage(textbook.images, textbook.id);

    const isFree = forceFree || textbook.price === 0;
    const priceText = isFree ? '免费' : `¥${textbook.price}`;

    return (
        <Link
            to={`/textbook/${textbook.id}`}
            className={cn(
                'group block h-full rounded-2xl bg-white dark:bg-gray-800',
                'shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700',
                'hover:shadow-md transition-shadow',
                className
            )}
        >
            {/* 封面 */}
            <div className="relative overflow-hidden rounded-t-2xl bg-gray-50 dark:bg-gray-900">
                <div className="aspect-[4/5] w-full">
                    <img
                        src={imageUrl}
                        alt={textbook.title}
                        className="h-full w-full object-contain p-6 bg-white/60 dark:bg-gray-800/60 transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                    />
                </div>

                {/* 左上角：新旧程度 */}
                {condition ? (
                    <span
                        className={cn(
                            'absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold',
                            getConditionStyle(condition)
                        )}
                    >
            {condition}
          </span>
                ) : null}

                {/* 右上角：免费 */}
                {isFree ? (
                    <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
            FREE
          </span>
                ) : null}
            </div>

            {/* 信息 */}
            <div className="p-4">
                {/* 类目/课程 */}
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {textbook.courseName} · {textbook.courseCode}
                </div>

                <h3 className="mt-2 text-base font-extrabold text-gray-900 dark:text-white line-clamp-2">
                    {textbook.title}
                </h3>

                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                    作者：{textbook.author || '—'}
                </div>

                <div className="mt-4 flex items-center justify-between">
          <span
              className={cn(
                  'text-base font-extrabold',
                  isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-300'
              )}
          >
            {priceText}
          </span>

                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            查看详情 <i className="fa-solid fa-arrow-right text-xs opacity-80"></i>
          </span>
                </div>
            </div>
        </Link>
    );
}