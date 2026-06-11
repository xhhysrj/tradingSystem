import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

interface ScrollCarouselProps {
    children: React.ReactNode;
    className?: string;
    scrollStep?: number;
}

export function ScrollCarousel({ children, className, scrollStep = 360 }: ScrollCarouselProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const childCount = Children.count(children);

    const updateScrollState = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const maxScrollLeft = el.scrollWidth - el.clientWidth;

        setCanScrollLeft(el.scrollLeft > 1);
        setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
    }, []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;


        const raf = requestAnimationFrame(updateScrollState);

        const onScroll = () => updateScrollState();
        el.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', updateScrollState);

        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', updateScrollState);
        };

    }, [updateScrollState, childCount]);

    const scrollByDir = (dir: 'left' | 'right') => {
        const el = scrollerRef.current;
        if (!el) return;

        el.scrollBy({
            left: dir === 'left' ? -scrollStep : scrollStep,
            behavior: 'smooth',
        });
    };

    return (
        <div className="relative">
            <button
                type="button"
                aria-label="向左滚动"
                onClick={() => scrollByDir('left')}
                disabled={!canScrollLeft}
                className={cn(
                    'absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2',
                    'h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur',
                    'shadow-md ring-1 ring-gray-200/70 dark:ring-gray-700',
                    'flex items-center justify-center text-gray-700 dark:text-gray-200',
                    'hover:bg-white dark:hover:bg-gray-800',
                    'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
            >
                <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>

            <div
                ref={scrollerRef}
                className={cn(
                    'flex gap-6 overflow-x-auto scroll-smooth pb-4',
                    'snap-x snap-mandatory',
                    'no-scrollbar',
                    className
                )}
            >
                {children}
            </div>

            <button
                type="button"
                aria-label="向右滚动"
                onClick={() => scrollByDir('right')}
                disabled={!canScrollRight}
                className={cn(
                    'absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2',
                    'h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur',
                    'shadow-md ring-1 ring-gray-200/70 dark:ring-gray-700',
                    'flex items-center justify-center text-gray-700 dark:text-gray-200',
                    'hover:bg-white dark:hover:bg-gray-800',
                    'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
            >
                <i className="fa-solid fa-chevron-right text-sm"></i>
            </button>
        </div>
    );
}