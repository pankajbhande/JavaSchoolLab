import { useState, useMemo, useEffect, useRef } from 'react';
import { PanelRightClose, PanelRight, CheckCircle, Users, Globe, Award, TrendingUp, BookOpen, Sparkles, Lightbulb, XCircle, Inbox } from 'lucide-react';
import type { Course, Topic } from '../data/types';
import { buildKeypoints } from '../services/keypoints';
import { questionsForTopic } from '../lib/topicQuestions';
import { allStudyPacks, type StudyPack } from '../data/studyPacks';
import { useDataset } from '../hooks/useDataset';
import { useVisitorCount } from '../hooks/useVisitorCount';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AdSlot } from './ads/AdSlot';
import { AD_SLOTS } from './ads/adsense';

interface RightSidebarProps {
  course: Course | null;
  /** The topic itself, so keypoints can be drawn from its own content. */
  topic: Topic | null;
  topicName: string | null;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

interface MCQQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  reason: string;
}

// Generate MCQ questions from interview questions for a topic
// Every generated question below places its correct option first. Left as-is that
// teaches students to pick option A, so the options are shuffled before display.
// The shuffle is seeded from the question text: unbiased across questions, but stable
// across re-renders so the list does not reorder while someone is reading it.
function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function withShuffledOptions(mcq: MCQQuestion): MCQQuestion {
  let seed = seedFrom(mcq.question) || 1;
  const next = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const tagged = mcq.options.map((text, i) => ({ text, isAnswer: i === mcq.correctIndex }));
  for (let i = tagged.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [tagged[i], tagged[j]] = [tagged[j], tagged[i]];
  }
  const correctIndex = tagged.findIndex(o => o.isAnswer);
  return { ...mcq, options: tagged.map(o => o.text), correctIndex: correctIndex < 0 ? 0 : correctIndex };
}
function generateMCQs(questions: string[], topicName: string): MCQQuestion[] {
  const mcqs: MCQQuestion[] = [];

  questions.forEach((q) => {
    const lowerQ = q.toLowerCase();

    // Pattern: "difference between X and Y"
    if (lowerQ.includes('difference between')) {
      const match = q.match(/difference between\s+(.+?)\s+and\s+(.+?)[\?\.]?$/i);
      if (match) {
        const [a, b] = [match[1].trim(), match[2].trim()];
        mcqs.push({
          question: q,
          options: [
            `${a} and ${b} differ in how/when they are used, even though they look related`,
            `${a} and ${b} are exactly the same, just different names`,
            `${b} is simply a newer, faster version of ${a} with no other difference`,
            `${a} and ${b} belong to different programming languages entirely`,
          ],
          correctIndex: 0,
          reason: `${a} and ${b} solve related problems but are distinct concepts with their own rules - see the topic page's comparison table for the exact differences.`,
        });
        return;
      }
    }

    // Pattern: "What is X"
    if (lowerQ.startsWith('what is')) {
      const termMatch = q.match(/what is\s+(?:the\s+|an?\s+)?(.+?)\??$/i);
      const term = (termMatch ? termMatch[1] : topicName).trim();
      mcqs.push({
        question: q,
        options: [
          `${term} - a specific Java concept covered in this topic`,
          `A build tool unrelated to the Java language itself`,
          `A feature that was removed in later Java versions`,
          `A third-party library, not part of core Java`,
        ],
        correctIndex: 0,
        reason: `${term} is exactly what it's named - review this topic's "beginner" section for its precise definition and role.`,
      });
      return;
    }

    // Pattern: "How does X work"
    if (lowerQ.includes('how does') || lowerQ.includes('how do')) {
      mcqs.push({
        question: q,
        options: [
          `Through the specific mechanism described in this topic (internal data structures/runtime behavior)`,
          `Using simple arrays only, with no other data structure involved`,
          `Purely through recursion, with no iterative path`,
          `It is not actually implemented in the JVM`,
        ],
        correctIndex: 0,
        reason: `The exact mechanism is explained step-by-step in this topic's content - it relies on Java's own internal implementation, not a generic fallback.`,
      });
      return;
    }

    // Pattern: "Explain X"
    if (lowerQ.startsWith('explain')) {
      mcqs.push({
        question: q,
        options: [
          `It is a real, actively-used Java mechanism - see this topic's explanation`,
          `It only exists in Python, not Java`,
          `It was deprecated and no longer works in modern Java`,
          `It is a hardware-level feature, not something Java code controls`,
        ],
        correctIndex: 0,
        reason: `This concept is a standard part of the Java language/platform - the topic content walks through what it does and why it matters.`,
      });
      return;
    }

    // Pattern: "When would you use X"
    if (lowerQ.includes('when would') || lowerQ.includes('when to use') || lowerQ.includes('when should')) {
      mcqs.push({
        question: q,
        options: [
          `When the specific use case requires its unique properties`,
          `Never - it is deprecated and should always be avoided`,
          `Only in single-threaded applications`,
          `Only when working with primitive data types`,
        ],
        correctIndex: 0,
        reason: `Like most Java tools/features, this one is a fit for particular situations, not a universal default - the right call depends on the trade-off it solves for.`,
      });
      return;
    }

    // Default pattern
    mcqs.push({
      question: q,
      options: [
        `Correct - directly related to ${topicName} fundamentals`,
        `Incorrect - this is a C++ concept, not Java`,
        `Incorrect - not applicable anywhere in Java`,
        `Incorrect - only existed in very old Java versions and is gone now`,
      ],
      correctIndex: 0,
      reason: `This question is about a core idea within ${topicName} - revisit the topic's content blocks above for the full explanation.`,
    });
  });

  return mcqs.map(withShuffledOptions);
}

// Counts up to `value`: from 0 the first time, and from the number already on screen after that,
// so a live refresh of the visitor total ticks up by a few instead of flashing back to 0.
function useCountUp(value: number, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const shown = useRef(0);
  shown.current = display;

  useEffect(() => {
    if (value <= 0) { setDisplay(0); return; }
    const from = shown.current > 0 && shown.current <= value ? shown.current : 0;
    let start: number | null = null;
    let frame: number;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + eased * (value - from)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}

export function RightSidebar({ course, topic, topicName, isMinimized, onToggleMinimize }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'cheatsheet' | 'interview' | 'keypoints'>('keypoints');
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const reduceMotion = useReducedMotion();
  const [picked, setPicked] = useState<Record<number, number>>({});
  const { count: visitorCount } = useVisitorCount();
  const animatedVisitorCount = useCountUp(visitorCount);

  const toggleReveal = (index: number) => {
    const newRevealed = new Set(revealedAnswers);
    if (newRevealed.has(index)) {
      newRevealed.delete(index);
    } else {
      newRevealed.add(index);
    }
    setRevealedAnswers(newRevealed);
  };

  // Hand-written study material for this topic (keypoints, interview Q&A, MCQs), if any.
  const { data: packs } = useDataset<Record<string, StudyPack>>('study-packs', allStudyPacks);
  const pack = useMemo(
    () => (course?.id && topic?.id ? packs?.[`${course.id}/${topic.id}`] : undefined),
    [packs, course?.id, topic?.id],
  );

  // Authored questions come first (they have model answers), then any other question the
  // course data holds for this topic.
  const noteQA = topic?.interviewQA;
  const answerByQuestion = useMemo(() => new Map([...(noteQA ?? []), ...(pack?.interview ?? [])].filter(([, a]) => a)), [pack, noteQA]);
  const topicQuestions = useMemo(() => {
    const authored = [...(pack?.interview ?? []), ...(noteQA ?? [])].map(([q]) => q).filter((q, i, all) => all.indexOf(q) === i);
    const seen = new Set(authored.map(q => q.toLowerCase()));
    const derived = questionsForTopic(course, topicName).filter(q => !seen.has(q.toLowerCase()));
    return [...authored, ...derived];
  }, [pack, noteQA, course, topicName]);
  const [revealedInterview, setRevealedInterview] = useState<Set<string>>(new Set());

  // Real MCQs when the topic has them; otherwise the generic ones built from the questions.
  const mcqQuestions = useMemo(() => {
    if (pack?.mcq?.length) {
      return pack.mcq.map(([question, options, reason]) =>
        withShuffledOptions({ question, options: [...options], correctIndex: 0, reason }));
    }
    if (!course || topicQuestions.length === 0) return [];
    return generateMCQs(topicQuestions, topicName || course.name);
  }, [pack, topicQuestions, topicName, course]);

  // Keypoints filtered down to just the ones relevant to the current topic
  // Scoped to the topic on screen. The previous implementation matched keywords against
  // the COURSE-wide cheat notes and, when nothing matched, returned the entire list - so
  // "Features of Java" showed sealed class, permits, record and HttpClient. There is now
  // deliberately no whole-course fallback.
  const topicKeypoints = useMemo(() => {
    const derived = buildKeypoints(topic, course?.cheatNotes ?? [], course?.name, course?.subTopics.flatMap(st => st.topics.map(t => t.name)) ?? []);
    const authored = (pack?.keypoints ?? []).map(([term, detail]) => ({ term, detail }));
    const seen = new Set(authored.map(k => k.term.toLowerCase()));
    return [...authored, ...derived.filter(k => !seen.has(k.term.toLowerCase()))];
  }, [topic, course, pack]);

  const toggleButton = (
    <motion.button
      whileHover={reduceMotion ? undefined : { scale: 1.1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      onClick={onToggleMinimize}
      aria-expanded={!isMinimized}
      className="shrink-0 grid place-items-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      title={isMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
      aria-label={isMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
    >
      {isMinimized ? <PanelRight className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
    </motion.button>
  );

  return (
    <motion.aside
      aria-label="Notes and interview questions"
      initial={false}
      animate={{ width: isMinimized ? 60 : 304 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
      className="relative bg-gradient-to-br from-orange-100/90 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-orange-950/25 dark:to-gray-900 border-l border-orange-200/70 dark:border-orange-900/40 overflow-hidden h-[calc(100vh-80px)] flex flex-col"
    >
      {/* Decorative premium glow accents — purely visual, sits behind all content */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-orange-300/30 dark:bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-10 w-48 h-48 rounded-full bg-amber-300/25 dark:bg-amber-500/10 blur-3xl" />

      {/* The toggle only gets its own bar when it can't ride along on the tab row: while
          collapsed, or before a topic is selected (no tabs yet). */}
      {(isMinimized || topicQuestions.length === 0) && (
        <div className="relative px-2 py-1 border-b border-orange-200/60 dark:border-gray-700 flex justify-start">
          {toggleButton}
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ zoom: 0.95 }}>
        {/* Rail units sit outside the AnimatePresence block: they must not be unmounted
            and remounted by the panel's enter/exit animation, which would burn an ad
            request on every keypoint re-render. */}
        {!isMinimized && (
          <div className="px-2 pt-1">
            <AdSlot slot={AD_SLOTS.railTop} width={300} height={250} format="rectangle" />
          </div>
        )}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={topicQuestions.length === 0 ? "p-2" : "px-3 pt-2 pb-3"}
            >
              {/* Branding Panel - shown when no topic selected */}
              {topicQuestions.length === 0 && (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                  className="space-y-3"
                >
                  {/* Branding Header */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    className="relative overflow-hidden rounded-xl p-4 text-white text-center shadow-lg bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600"
                  >
                    {/* Diagonal light sweep */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                      style={{ width: '40%' }}
                      animate={{ x: ['-60%', '220%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                    />
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative"
                    >
                      <Globe className="w-8 h-8 mx-auto mb-2 drop-shadow" />
                    </motion.div>
                    <h3 className="relative text-sm font-bold leading-tight">JavaSchoolLab</h3>
                    <p className="relative text-[10px] mt-1 opacity-90">India's Best Java Learning Platform</p>
                  </motion.div>

                  {/* Visitor Counter */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm text-center overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-semibold text-green-500">
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-green-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      />
                      LIVE
                    </span>
                    <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Total Visitors</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1 tabular-nums">
                      {animatedVisitorCount.toLocaleString('en-IN')}+
                    </p>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {[
                      { icon: BookOpen, value: '54+', label: 'Topics', color: 'text-blue-500', ring: 'hover:border-blue-300 dark:hover:border-blue-700' },
                      { icon: Award, value: '500+', label: 'Questions', color: 'text-green-500', ring: 'hover:border-green-300 dark:hover:border-green-700' },
                      { icon: TrendingUp, value: '10+', label: 'Courses', color: 'text-purple-500', ring: 'hover:border-purple-300 dark:hover:border-purple-700' },
                      { icon: CheckCircle, value: 'Free', label: '100% Free', color: 'text-orange-500', ring: 'hover:border-orange-300 dark:hover:border-orange-700' },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -2 }}
                        className={`bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center transition-all shadow-sm hover:shadow-md ${stat.ring}`}
                      >
                        <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Made in India Badge */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-green-50 dark:from-orange-900/20 dark:to-green-900/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800 text-center"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />
                    <p className="text-lg mb-1">&#127470;&#127475;</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Made in India</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">World's Best Indian Java Platform</p>
                  </motion.div>

                  {/* Call to Action */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  >
                    <motion.div
                      animate={{ boxShadow: ['0 0 0 0 rgba(59,130,246,0.15)', '0 0 0 6px rgba(59,130,246,0)', '0 0 0 0 rgba(59,130,246,0.15)'] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 text-center"
                    >
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Select a topic to start learning</p>
                      <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1">Interview Questions will appear here</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* Tabs - only shown when topic is selected */}
              {topicQuestions.length > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                {toggleButton}
                <div role="tablist" aria-label="Study panel sections" className="grid flex-1 min-w-0 grid-cols-3 gap-1 p-1 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-orange-200/70 dark:border-white/10">
                  {([
                    { id: 'keypoints', label: 'Keypoints', icon: Lightbulb },
                    { id: 'cheatsheet', label: 'Interview Qs', icon: BookOpen },
                    { id: 'interview', label: 'MCQ', icon: CheckCircle },
                  ] as const).map(({ id, label, icon: Icon }) => {
                    const active = activeTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        id={`study-tab-${id}`}
                        aria-selected={active}
                        aria-controls="study-tabpanel"
                        tabIndex={active ? 0 : -1}
                        onClick={() => { setActiveTab(id); if (id === 'interview') setRevealedAnswers(new Set()); }}
                        onKeyDown={(e) => {
                          const order = ['keypoints', 'cheatsheet', 'interview'] as const;
                          const i = order.indexOf(activeTab);
                          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                            e.preventDefault();
                            const n = order[(i + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length];
                            setActiveTab(n);
                            document.getElementById(`study-tab-${n}`)?.focus();
                          }
                        }}
                        className={`flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg whitespace-nowrap text-[11px] leading-tight font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 dark:focus-visible:ring-orange-300 ${
                          active
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              <div id="study-tabpanel" role="tabpanel" aria-labelledby={`study-tab-${activeTab}`}>
              {/* Keypoints / Notes Tab */}
              {activeTab === 'keypoints' && course && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Quick Revision Notes</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-3 py-1.5 bg-white/70 dark:bg-gray-800/60 rounded-r-lg">
                      <h3 className="font-display font-bold text-base text-gray-900 dark:text-gray-100">{topicName || course.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{topicKeypoints.length} keypoints</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 pb-16 list-none p-0 m-0">
                    {topicKeypoints.length > 0 ? (
                      topicKeypoints.map((note, index) => {
                        const { term, detail: explanation } = note;
                        return (
                          <motion.li
                            key={index}
                            initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: reduceMotion ? 0 : Math.min(index, 20) * 0.02 }}
                            className="relative overflow-hidden bg-white dark:bg-gray-800/70 rounded-xl p-3 pl-4 border border-amber-200/80 dark:border-white/10 shadow-sm"
                          >
                            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-400 to-cyan-500" aria-hidden="true" />
                            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-400/30 text-[13px] font-bold text-emerald-900 dark:text-emerald-200 leading-snug">{term}</span>
                            {explanation && <p className="mt-1.5 text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">{explanation}</p>}
                          </motion.li>
                        );
                      })
                    ) : (
                      <li className="flex flex-col items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                        <Inbox className="w-6 h-6" aria-hidden="true" />
                        No keypoints for this topic yet
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}

              {/* Interview Questions Tab */}
              {activeTab === 'cheatsheet' && course && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {topicName && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <Lightbulb className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Interview Questions
                        </p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-3 py-1.5 bg-white/70 dark:bg-gray-800/60 rounded-r-lg">
                        <h3 className="font-display font-bold text-base text-gray-900 dark:text-gray-100">{topicName}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{topicQuestions.length} questions</p>
                      </div>
                    </div>
                  )}

                  <ol className="space-y-3 pb-16 list-none p-0 m-0">
                    {topicQuestions.map((question, index) => {
                      const open = revealedInterview.has(question);
                      const hasAnswer = answerByQuestion.has(question);
                      return (
                      <li
                        key={index}
                        className="relative overflow-hidden bg-white dark:bg-gray-800/70 rounded-xl p-3 pl-4 border border-amber-200/80 dark:border-white/10 shadow-sm flex gap-2.5"
                      >
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange-400 to-amber-500" aria-hidden="true" />
                        <span className="shrink-0 w-7 h-7 rounded-md bg-orange-50 dark:bg-black/60 border border-orange-300 dark:border-orange-400/40 text-orange-700 dark:text-orange-300 font-mono text-xs font-bold flex items-center justify-center" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 leading-relaxed pt-0.5">{question}</p>
                          {hasAnswer && (
                            <>
                              <button
                                type="button"
                                onClick={() => setRevealedInterview(prev => {
                                  const next = new Set(prev);
                                  if (next.has(question)) next.delete(question); else next.add(question);
                                  return next;
                                })}
                                aria-expanded={open}
                                aria-controls={`qa-answer-${index}`}
                                className="mt-2 text-xs font-semibold px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-500/15 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-400/40 hover:bg-orange-100 dark:hover:bg-orange-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 dark:focus-visible:ring-orange-300"
                              >
                                {open ? 'Hide answer' : 'Show answer'}
                              </button>
                              {open && (
                                <div id={`qa-answer-${index}`} className="mt-2 px-2.5 py-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-400/30 text-[13px] leading-relaxed text-cyan-950 dark:text-cyan-100">
                                  <span className="block mb-0.5 text-[11px] font-bold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">Answer</span>
                                  {renderAnswer(answerByQuestion.get(question) ?? '')}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </li>
                      );
                    })}

                    {topicQuestions.length === 0 && (
                      <li className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                        Select a topic to view interview questions
                      </li>
                    )}
                  </ol>
                </motion.div>
              )}

              {/* MCQ Interview Tab */}
              {activeTab === 'interview' && course && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {topicName && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <CheckCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">MCQ Practice</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-3 py-1.5 bg-white/70 dark:bg-gray-800/60 rounded-r-lg">
                        <h3 className="font-display font-bold text-base text-gray-900 dark:text-gray-100">{topicName}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{mcqQuestions.length} questions</p>
                      </div>
                    </div>
                  )}

                  {mcqQuestions.length > 0 && (() => {
                    const answered = Object.keys(picked).filter(k => Number(k) < mcqQuestions.length).length;
                    const right = mcqQuestions.reduce((n, m, i) => n + (picked[i] === m.correctIndex ? 1 : 0), 0);
                    return (
                      <div role="status" aria-live="polite" className="mb-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800/70 border border-amber-200/80 dark:border-white/10 text-xs text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">Score: {right} / {mcqQuestions.length}</span>
                        <span className="text-gray-600 dark:text-gray-400">{answered} of {mcqQuestions.length} answered</span>
                        {answered > 0 && (
                          <button type="button" onClick={() => { setPicked({}); setRevealedAnswers(new Set()); }} className="font-semibold text-purple-800 dark:text-purple-300 underline underline-offset-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600">
                            Reset
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <div className="space-y-4 pb-16">
                    {mcqQuestions.map((mcq, index) => {
                      const choice = picked[index];
                      const hasChoice = choice !== undefined;
                      const isRevealed = revealedAnswers.has(index) || hasChoice;
                      const gotIt = hasChoice && choice === mcq.correctIndex;
                      return (
                      <div
                        key={index}
                        role="group"
                        aria-labelledby={`mcq-q-${index}`}
                        className="relative overflow-hidden bg-white dark:bg-gray-800/70 rounded-xl p-3 border border-amber-200/80 dark:border-white/10 shadow-sm"
                      >
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-400 to-fuchsia-500" aria-hidden="true" />
                        <p id={`mcq-q-${index}`} className="text-[13px] font-semibold text-gray-900 dark:text-white mb-2.5 flex gap-2 pl-1 leading-relaxed">
                          <span className="shrink-0 w-6 h-6 rounded-md bg-purple-50 dark:bg-black/60 border border-purple-300 dark:border-purple-400/40 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-bold flex items-center justify-center">{String(index + 1).padStart(2, '0')}</span>
                          <span>{mcq.question}</span>
                        </p>

                        <div className="space-y-1.5 pl-1">
                          {mcq.options.map((option, oIndex) => {
                            const isCorrect = oIndex === mcq.correctIndex;
                            const isChosen = choice === oIndex;
                            const showRight = isRevealed && isCorrect;
                            const showWrong = isChosen && !isCorrect;
                            return (
                              <button
                                type="button"
                                key={oIndex}
                                onClick={() => setPicked(prev => (prev[index] === undefined ? { ...prev, [index]: oIndex } : prev))}
                                disabled={hasChoice}
                                aria-pressed={isChosen}
                                className={`w-full text-left flex items-start gap-2 px-2.5 py-2 rounded-lg text-[13px] leading-snug border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 dark:focus-visible:ring-purple-300 disabled:cursor-default ${
                                  showRight
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 dark:border-emerald-400/60'
                                    : showWrong
                                    ? 'bg-red-50 dark:bg-red-500/10 border-red-500 dark:border-red-400/60'
                                    : 'bg-amber-50/60 dark:bg-white/5 border-amber-200 dark:border-white/10 enabled:hover:border-purple-400 enabled:hover:bg-purple-50 dark:enabled:hover:bg-purple-500/10'
                                }`}
                              >
                                <span className={`font-mono font-bold shrink-0 ${
                                  showRight ? 'text-emerald-700 dark:text-emerald-300' : showWrong ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {String.fromCharCode(65 + oIndex)}.
                                </span>
                                <span className={`flex-1 ${
                                  showRight ? 'text-emerald-900 dark:text-emerald-200 font-semibold' : showWrong ? 'text-red-900 dark:text-red-200 font-semibold' : 'text-gray-800 dark:text-gray-200'
                                }`}>
                                  {option}
                                </span>
                                {showRight && (
                                  <span className="shrink-0 flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />Correct
                                  </span>
                                )}
                                {showWrong && (
                                  <span className="shrink-0 flex items-center gap-0.5 text-[11px] font-bold text-red-700 dark:text-red-300">
                                    <XCircle className="w-4 h-4" aria-hidden="true" />Your pick
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {hasChoice && (
                          <p role="status" className={`mt-2 ml-1 flex items-center gap-1 text-xs font-bold ${gotIt ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                            {gotIt ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
                            {gotIt ? 'Correct!' : 'Not quite - see the correct answer above.'}
                          </p>
                        )}

                        <AnimatePresence>
                          {isRevealed && (
                            <motion.div
                              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                              transition={{ duration: reduceMotion ? 0 : 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 ml-1 flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-400/30">
                                <Lightbulb className="w-4 h-4 text-cyan-700 dark:text-cyan-400 shrink-0 mt-px" aria-hidden="true" />
                                <span className="text-xs leading-relaxed text-cyan-950 dark:text-cyan-100">
                                  <span className="font-bold text-cyan-800 dark:text-cyan-300">Why: </span>
                                  {mcq.reason}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {!hasChoice && (
                          <button
                            type="button"
                            onClick={() => toggleReveal(index)}
                            aria-expanded={revealedAnswers.has(index)}
                            className={`mt-2 ml-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 dark:focus-visible:ring-purple-300 ${
                              revealedAnswers.has(index)
                                ? 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-white/10'
                                : 'bg-purple-50 dark:bg-purple-500/15 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-400/40 hover:bg-purple-100 dark:hover:bg-purple-500/25'
                            }`}
                          >
                            {revealedAnswers.has(index) ? 'Hide answer' : 'Show answer'}
                          </button>
                        )}
                      </div>
                      );
                    })}

                    {mcqQuestions.length === 0 && (
                      <div className="flex flex-col items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                        <Inbox className="w-6 h-6" aria-hidden="true" />
                        No MCQ practice for this topic yet
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              </div>

              {!course && (
                <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                  Select a course to view content
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isMinimized && (
          <div className="px-2 pb-4 pt-2">
            <AdSlot slot={AD_SLOTS.railBottom} width={300} height={250} format="rectangle" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}

// Renders an answer, turning `backticked` terms into highlighted code chips.
function renderAnswer(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.length > 2 && part.startsWith('`') && part.endsWith('`')
      ? <code key={i} className="px-1 py-px rounded bg-cyan-100 dark:bg-cyan-400/20 text-cyan-900 dark:text-cyan-100 font-mono text-[12px] font-semibold">{part.slice(1, -1)}</code>
      : <span key={i}>{part}</span>
  );
}
