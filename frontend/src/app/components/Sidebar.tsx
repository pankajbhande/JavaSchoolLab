import { ShareButton } from './ShareButton';
import { useState, useEffect, useRef, Fragment } from 'react';
import { Code, BookOpen, FileText, Database, PanelLeftClose, PanelLeft, Layers, CheckCircle2 } from 'lucide-react';
import type { Course } from '../data/types';
import { displayTopicName } from '../lib/topicName';
import { motion, AnimatePresence } from 'motion/react';

// Wraps matching substrings of `text` in <mark> for instant-search highlighting
function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={i} className="bg-orange-300 dark:bg-orange-600 text-inherit rounded-sm px-0.5">{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

interface SidebarProps {
  courses: Course[];
  selectedCourse: string | null;
  selectedSubTopic: string | null;
  selectedTopic: string | null;
  onCourseSelect: (courseId: string) => void;
  onSubTopicSelect: (subTopicId: string) => void;
  onTopicSelect: (topicId: string) => void;
  searchQuery?: string;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  visitedTopics?: Set<string>;
}

export function Sidebar({
  courses, selectedCourse, selectedSubTopic, selectedTopic,
  onCourseSelect, onSubTopicSelect, onTopicSelect,
  searchQuery, isMinimized, onToggleMinimize, visitedTopics
}: SidebarProps) {
  const query = (searchQuery || '').trim().toLowerCase();
  const activeTopicRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTimeout(() => {
      activeTopicRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
  }, [selectedTopic]);

  const getIcon = (iconName: string) => {
    const cls = "w-4 h-4";
    switch (iconName) {
      case 'Code': return <Code className={cls} />;
      case 'BookOpen': return <BookOpen className={cls} />;
      case 'FileText': return <FileText className={cls} />;
      case 'Database': return <Database className={cls} />;
      default: return <Code className={cls} />;
    }
  };

  const topicCount = (subTopics: Course['subTopics']) =>
    subTopics.reduce((sum, st) => sum + st.topics.length, 0);

  const toggleButton = (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggleMinimize}
      className="shrink-0 grid place-items-center w-8 h-8 rounded-lg bg-orange-600 text-white shadow-md shadow-orange-500/30 hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-50 dark:focus-visible:ring-offset-gray-900"
      aria-expanded={!isMinimized}
      title={isMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
      aria-label={isMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
    >
      {isMinimized ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
    </motion.button>
  );

  // The one open course is named in the pinned header; with several courses listed each keeps its own heading in the list.
  const pinnedCourse = selectedCourse ? courses.find(c => c.id === selectedCourse) ?? null : null;

  return (
    <motion.aside
      aria-label="Course contents"
      initial={false}
      animate={{ width: isMinimized ? 60 : 300 }}
      transition={{ duration: 0.3 }}
      className="relative bg-gradient-to-bl from-orange-100/90 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-orange-950/25 dark:to-gray-900 border-r border-orange-200/70 dark:border-orange-900/40 overflow-hidden h-[calc(100vh-80px)] max-h-full flex flex-col"
    >
      {/* Decorative premium glow accents — purely visual, sits behind all content */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-orange-300/30 dark:bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-10 w-48 h-48 rounded-full bg-amber-300/25 dark:bg-amber-500/10 blur-3xl" />

      {/* Collapsed rail: the toggle stands alone. Expanded, it lives on the COURSE label row. */}
      {isMinimized && (
        <div className="relative px-2 py-1 border-b border-orange-200/60 dark:border-gray-700 flex justify-end">
          {toggleButton}
        </div>
      )}

      {/* Pinned header: the COURSE label, the toggle and the course name stay put while only the topic list scrolls. */}
      {!isMinimized && (
        <div className="relative shrink-0 border-b border-orange-200/60 dark:border-gray-700 px-3 pt-2 pb-2">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Layers className="w-3.5 h-3.5 text-orange-500" />
            <h2 className="font-bold text-[11px] text-gray-800 dark:text-gray-200 uppercase tracking-wider">Course</h2>
            <span className="ml-auto">{toggleButton}</span>
          </div>
          {pinnedCourse && (
            <div className="border-l-4 border-orange-500 pl-2.5">
              <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                <Highlight text={pinnedCourse.name} query={query} />
              </h3>
              <ShareButton kind="course" courseId={pinnedCourse.id} courseName={pinnedCourse.name} variant="chip" menuAlign="left" />
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                {topicCount(pinnedCourse.subTopics)} topics · Select a topic to start learning
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2 pb-20"
            >
              {courses
                .filter(course => !selectedCourse || course.id === selectedCourse)
                .map(course => {
                  let idx = 0;
                  return (
                    <div key={course.id}>
                      {!pinnedCourse && (
                        <div className="border-l-4 border-orange-500 pl-2.5 mb-2">
                          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                            <Highlight text={course.name} query={query} />
                          </h3>
                          <p className="text-[11px] text-gray-600 dark:text-gray-400">
                            {topicCount(course.subTopics)} topics · Select a topic to start learning
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        {course.subTopics.map(subTopic => {
                          const subTopicMatches = !query || subTopic.name.toLowerCase().includes(query);
                          const visibleTopics = subTopic.topics.filter(topic =>
                            !query || subTopicMatches || topic.name.toLowerCase().includes(query)
                          );
                          if (query && visibleTopics.length === 0) return null;
                          return (
                          <div key={subTopic.id}>
                            <div className="px-2 pb-1 pt-2 mt-1 border-t border-orange-200/50 dark:border-white/5 first:border-t-0">
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                                <Highlight text={subTopic.name} query={query} />
                              </h4>
                            </div>
                            <div className="space-y-0">
                              {visibleTopics.map(topic => {
                                idx++;
                                const num = idx;
                                const isActive = selectedTopic === topic.id;
                                const isVisited = visitedTopics?.has(topic.id);
                                return (
                                  <button
                                    key={topic.id}
                                    ref={isActive ? activeTopicRef : null}
                                    onClick={() => onTopicSelect(topic.id)}
                                    aria-current={isActive ? 'page' : undefined}
                                    title={displayTopicName(topic.name, course.name)}
                                    className={`relative w-full flex items-center gap-2 px-2 min-h-[34px] py-1.5 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                                      isActive
                                        ? 'bg-white dark:bg-orange-500/15 shadow-sm ring-1 ring-orange-200/70 dark:ring-orange-800/40'
                                        : 'hover:bg-white/60 dark:hover:bg-gray-700/50'
                                    }`}
                                  >
                                    {isActive && <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-orange-500" />}
                                    <span className={`text-[11px] font-mono w-5 text-right shrink-0 ${
                                      isActive ? 'text-orange-700 dark:text-orange-400 font-semibold' : 'text-gray-600 dark:text-gray-400'
                                    }`}>{num}.</span>
                                    <span className={`text-[13px] truncate flex-1 ${
                                      isActive
                                        ? 'text-orange-800 dark:text-orange-300 font-semibold'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      <Highlight text={displayTopicName(topic.name, course.name)} query={query} />
                                    </span>
                                    {isVisited && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" aria-label="Visited" role="img" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              }
            </motion.div>
          )}
        </AnimatePresence>

        {isMinimized && (
          <div className="p-2 space-y-2">
            {courses.map(course => (
              <motion.button
                key={course.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onCourseSelect(course.id)}
                className={`w-full p-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  selectedCourse === course.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={course.name}
                aria-label={course.name}
                aria-current={selectedCourse === course.id ? 'true' : undefined}
              >
                {getIcon(course.icon)}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
