import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Code, BookOpen, FileText, Database, Server, Layers, Layout } from 'lucide-react';
import type { Course } from '../data/types';
import { motion, useReducedMotion } from 'motion/react';

interface TopicsBarProps {
  courses: Course[];
  onCourseSelect: (courseId: string) => void;
  selectedCourseId: string | null;
}

const iconMap: Record<string, any> = {
  Code, BookOpen, FileText, Database, Server, Layers, Layout
};

const EDGE = 36; // px of fade at a scrollable edge

export function TopicsBar({ courses, onCourseSelect, selectedCourseId }: TopicsBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const reduceMotion = useReducedMotion();

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [courses, checkScroll]);

  // Scroll the selected course into view
  useEffect(() => {
    if (!scrollRef.current || !selectedCourseId) return;
    const activeBtn = scrollRef.current.querySelector(`[data-course-id="${selectedCourseId}"]`) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedCourseId, reduceMotion]);

  // Mouse wheel scrolls the bar sideways (only while it can scroll in that direction)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
      if (el.scrollWidth <= el.clientWidth || atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(240, Math.round(el.clientWidth * 0.6));
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Arrow / Home / End move focus between course tabs
  const onKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[data-course-id]'));
    const cur = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (cur < 0) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1
      : Math.min(btns.length - 1, Math.max(0, cur + (e.key === 'ArrowRight' ? 1 : -1)));
    btns[next]?.focus();
  };

  const getIcon = (name: string) => {
    const Icon = iconMap[name] || Code;
    return <Icon className="w-3.5 h-3.5" strokeWidth={2} />;
  };

  // Soft fade at the edges that can still be scrolled
  const mask = `linear-gradient(to right, ${canScrollLeft ? 'transparent' : 'black'} 0, black ${canScrollLeft ? EDGE : 0}px, black calc(100% - ${canScrollRight ? EDGE : 0}px), ${canScrollRight ? 'transparent' : 'black'} 100%)`;

  const arrowClass =
    'shrink-0 grid place-items-center w-9 h-9 rounded-full ' +
    'bg-gray-900/90 border border-white/10 text-gray-300 shadow-lg shadow-black/40 backdrop-blur ' +
    'hover:text-white hover:border-orange-400/50 hover:bg-gray-800 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 transition-colors';

  return (
    <nav
      aria-label="Courses"
      className="sticky top-[var(--app-header-h,80px)] z-40 border-b border-white/10 bg-gray-950/85 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]"
    >
      {/* ambient glow + hairline highlights */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_140%_at_50%_-40%,rgba(249,115,22,0.16),transparent_70%)]" />
      <span aria-hidden="true" className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/70 to-transparent" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative flex items-center">
        {/* Left arrow — its own slot beside the tabs, so it never covers a course button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll courses left"
            className={`${arrowClass} ml-2`}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        )}

        {/* Scrollable course tabs */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          onKeyDown={onKeyNav}
          className="flex flex-1 min-w-0 items-center gap-1.5 overflow-x-auto px-3 py-2 scrollbar-hide scroll-smooth"
        >
          {courses.map((course) => {
            const isActive = selectedCourseId === course.id;
            return (
              <motion.button
                key={course.id}
                type="button"
                data-course-id={course.id}
                aria-current={isActive ? 'page' : undefined}
                whileHover={reduceMotion ? undefined : { y: -1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => onCourseSelect(course.id)}
                className={`group relative flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 text-[13px] font-semibold tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-950 ${
                  isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                {/* sliding active pill */}
                {isActive && (
                  <motion.span
                    layoutId="course-pill"
                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-xl bg-orange-500 shadow-[0_4px_14px_rgba(249,115,22,0.45)]"
                  />
                )}
                {/* hover wash for inactive tabs */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.06] border border-transparent group-hover:border-white/10 transition-colors" />
                )}

                <span
                  className={`relative grid place-items-center w-6 h-6 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-white/[0.06] text-gray-400 group-hover:text-orange-300 group-hover:bg-orange-500/15'
                  }`}
                >
                  {getIcon(course.icon)}
                </span>
                <span className="relative">{course.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll courses right"
            className={`${arrowClass} mr-2`}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </nav>
  );
}
