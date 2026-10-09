import { useState, useMemo, useEffect } from 'react';
import { PanelRightClose, PanelRight, CheckCircle, Users, Globe, Award, TrendingUp, BookOpen, Sparkles, Lightbulb } from 'lucide-react';
import { Course, Topic } from '../data/coursesData';
import { buildKeypoints } from '../services/keypoints';
import { motion, AnimatePresence } from 'motion/react';
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

// Animates a number counting up from 0 to `value` whenever `value` changes
function useCountUp(value: number, duration = 1200) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value <= 0) { setDisplay(0); return; }
    let start: number | null = null;
    let frame: number;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}

// Visitor counter using localStorage
function useVisitorCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const STORAGE_KEY = 'javaschoollab_visitors';
    const VISIT_KEY = 'javaschoollab_visited';
    const BASE_COUNT = 51340; // Base visitor count

    const stored = localStorage.getItem(STORAGE_KEY);
    let currentCount = stored ? parseInt(stored, 10) : BASE_COUNT;

    // Increment only once per session
    if (!sessionStorage.getItem(VISIT_KEY)) {
      currentCount += 1;
      localStorage.setItem(STORAGE_KEY, currentCount.toString());
      sessionStorage.setItem(VISIT_KEY, 'true');
    }

    setCount(currentCount);
  }, []);

  return count;
}

export function RightSidebar({ course, topic, topicName, isMinimized, onToggleMinimize }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'cheatsheet' | 'interview' | 'keypoints'>('keypoints');
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const visitorCount = useVisitorCount();
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

  // Every interview question for this topic, across all companies.
  const topicQuestions = useMemo(() => {
    if (!course) return [];
    let allQuestions: string[] = [];

    if (!topicName) {
      return [];
    } else {
      const topicLower = topicName.toLowerCase();
      const commonWords = new Set(['in', 'of', 'and', 'the', 'a', 'an', 'to', 'is', 'for', 'with', 'between', 'difference', 'java', 'what', 'how', 'why']);
      const topicKeywords = topicLower.split(/[\s,\-&]+/).filter(w => w.length > 1 && !commonWords.has(w));

      // Try to find a matching interview question section by company name
      let bestMatch: typeof course.interviewQuestions[0] | null = null;
      let bestScore = 0;

      course.interviewQuestions.forEach(item => {
        const companyLower = item.company.toLowerCase();
        const matchCount = topicKeywords.filter(kw => companyLower.includes(kw)).length;
        if (matchCount > bestScore && matchCount >= Math.min(topicKeywords.length, 2)) {
          bestScore = matchCount;
          bestMatch = item;
        }
      });

      if (bestMatch) {
        (bestMatch as typeof course.interviewQuestions[0]).questions.forEach(q => allQuestions.push(q));
      } else {
        // Fallback: keyword match
        course.interviewQuestions.forEach(item => {
          item.questions.forEach(q => {
            const qLower = q.toLowerCase();
            if (qLower.includes(topicLower) || topicKeywords.some(kw => qLower.includes(kw))) {
              allQuestions.push(q);
            }
          });
        });

        // Previously this dumped EVERY question in the course when the topic matched
        // nothing, which is how unrelated questions reached the Interview and MCQ tabs.
        // An empty panel is better than a misleading one.
      }
    }

    // Levels were merged. The old split showed the first 10 questions under Basic and
    // only the remainder under Expert, so neither view ever listed them all - a topic
    // with 12 questions showed 10 or 2, never 12. Now every question is returned.
    return allQuestions;
  }, [course, topicName]);

  // Generate MCQs from the questions
  const mcqQuestions = useMemo(() => {
    if (!course || topicQuestions.length === 0) return [];
    return generateMCQs(topicQuestions, topicName || course.name);
  }, [topicQuestions, topicName, course]);

  // Keypoints filtered down to just the ones relevant to the current topic
  // Scoped to the topic on screen. The previous implementation matched keywords against
  // the COURSE-wide cheat notes and, when nothing matched, returned the entire list - so
  // "Features of Java" showed sealed class, permits, record and HttpClient. There is now
  // deliberately no whole-course fallback.
  const topicKeypoints = useMemo(
    () => buildKeypoints(topic, course?.cheatNotes ?? [], course?.name, course?.subTopics.flatMap(st => st.topics.map(t => t.name)) ?? []),
    [topic, course],
  );

  return (
    <motion.aside
      aria-label="Notes and interview questions"
      initial={false}
      animate={{ width: isMinimized ? 60 : 304 }}
      transition={{ duration: 0.3 }}
      className="relative bg-gradient-to-br from-orange-100/90 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-orange-950/25 dark:to-gray-900 border-l border-orange-200/70 dark:border-orange-900/40 overflow-hidden h-[calc(100vh-80px)] flex flex-col"
    >
      {/* Decorative premium glow accents — purely visual, sits behind all content */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-orange-300/30 dark:bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-10 w-48 h-48 rounded-full bg-amber-300/25 dark:bg-amber-500/10 blur-3xl" />

      <div className="relative px-2 py-1 border-b border-orange-200/60 dark:border-gray-700 flex justify-start">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMinimize}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          title={isMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
          aria-label={isMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {isMinimized ? <PanelRight className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ zoom: 0.95 }}>
        {/* Rail units sit outside the AnimatePresence block: they must not be unmounted
            and remounted by the panel's enter/exit animation, which would burn an ad
            request on every keypoint re-render. */}
        {!isMinimized && (
          <div className="px-2 pt-3">
            <AdSlot slot={AD_SLOTS.railTop} width={300} height={250} format="rectangle" />
          </div>
        )}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={topicQuestions.length === 0 ? "p-2" : "p-4"}
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
              <div className="flex gap-1.5 mb-4">
                <button
                  onClick={() => setActiveTab('keypoints')}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all ${
                    activeTab === 'keypoints'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Lightbulb className="w-3 h-3" />
                  <span className="text-xs font-medium">Keypoints</span>
                </button>
                <button
                  onClick={() => setActiveTab('cheatsheet')}
                  className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg transition-all ${
                    activeTab === 'cheatsheet'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xs font-medium">Interview Qs</span>
                </button>
                <button
                  onClick={() => { setActiveTab('interview'); setRevealedAnswers(new Set()); }}
                  className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg transition-all ${
                    activeTab === 'interview'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xs font-medium">MCQ</span>
                </button>
              </div>
              )}

              {/* Keypoints / Notes Tab */}
              {activeTab === 'keypoints' && course && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-1.5 px-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Quick Revision Notes</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-3 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-r-lg">
                      <h3 className="font-display font-bold text-base text-gray-800 dark:text-gray-200">{topicName || course.name}</h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{topicKeypoints.length} keypoints</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pb-16">
                    {topicKeypoints.length > 0 ? (
                      topicKeypoints.map((note, index) => {
                        const { term, detail: explanation } = note;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(index, 20) * 0.02 }}
                            className="group relative overflow-hidden bg-white dark:bg-gray-800/70 rounded-xl p-3 pl-4 border border-amber-200/80 dark:border-white/10 shadow-sm flex gap-2.5 transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md dark:hover:shadow-[0_0_16px_rgba(16,185,129,0.25)]"
                          >
                            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-400 to-cyan-500" />
                            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                              <span className="font-semibold text-gray-900 dark:text-white">{term}</span>
                              {explanation && <span className="text-gray-500 dark:text-gray-400"> - {explanation}</span>}
                            </p>
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No keypoints for this topic yet
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Interview Questions Tab */}
              {activeTab === 'cheatsheet' && course && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {topicName && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <Lightbulb className="w-3.5 h-3.5 text-orange-500" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Interview Questions
                        </p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-3 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-r-lg">
                        <h3 className="font-display font-bold text-base text-gray-800 dark:text-gray-200">{topicName}</h3>
                        <p className="text-[11px] text-gray-400">{topicQuestions.length} questions</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 pb-16">
                    {topicQuestions.map((question, index) => (
                      <div
                        key={index}
                        className="group relative overflow-hidden bg-white dark:bg-gray-800/70 rounded-xl p-3 pl-4 border border-amber-200/80 dark:border-white/10 shadow-sm flex gap-2.5 transition-all hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md dark:hover:shadow-[0_0_16px_rgba(249,115,22,0.25)]"
                      >
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange-400 to-amber-500" />
                        <span className="shrink-0 w-6 h-6 rounded-md bg-orange-50 dark:bg-black/60 border border-orange-300 dark:border-orange-400/40 text-orange-600 dark:text-orange-300 font-mono text-[11px] font-bold flex items-center justify-center">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">{question}</p>
                      </div>
                    ))}

                    {topicQuestions.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Select a topic to view interview questions
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* MCQ Interview Tab */}
              {activeTab === 'interview' && course && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {topicName && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <CheckCircle className="w-3.5 h-3.5 text-orange-500" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">MCQ Practice</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-3 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-r-lg">
                        <h3 className="font-display font-bold text-base text-gray-800 dark:text-gray-200">{topicName}</h3>
                        <p className="text-[11px] text-gray-400">{mcqQuestions.length} questions</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pb-16">
                    {mcqQuestions.map((mcq, index) => (
                      <div
                        key={index}
                        className="relative overflow-hidden bg-white dark:bg-gray-800/70 rounded-xl p-3 border border-amber-200/80 dark:border-white/10 shadow-sm hover:border-purple-400 transition-all"
                      >
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-400 to-fuchsia-500" />
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex gap-1.5 pl-1">
                          <span className="shrink-0 w-5 h-5 rounded-md bg-purple-50 dark:bg-black/60 border border-purple-300 dark:border-purple-400/40 text-purple-600 dark:text-purple-300 font-mono text-[10px] font-bold flex items-center justify-center">{String(index + 1).padStart(2, '0')}</span>
                          <span>{mcq.question}</span>
                        </p>

                        <div className="space-y-1.5 pl-1">
                          {mcq.options.map((option, oIndex) => {
                            const isCorrect = oIndex === mcq.correctIndex;
                            const isRevealed = revealedAnswers.has(index);

                            return (
                              <div
                                key={oIndex}
                                className={`flex items-start gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                                  isRevealed && isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-400 dark:border-emerald-400/50'
                                    : 'bg-amber-50/60 dark:bg-white/5 border border-amber-100 dark:border-white/5'
                                }`}
                              >
                                <span className={`font-mono font-bold shrink-0 mt-px ${
                                  isRevealed && isCorrect
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                  {String.fromCharCode(65 + oIndex)}.
                                </span>
                                <span className={`${
                                  isRevealed && isCorrect
                                    ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {option}
                                </span>
                                {isRevealed && isCorrect && (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-px ml-auto" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <AnimatePresence>
                          {revealedAnswers.has(index) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 ml-1 flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-400/30">
                                <Lightbulb className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-px" />
                                <span className="text-[11px] text-cyan-900 dark:text-cyan-200">
                                  <span className="font-semibold text-cyan-700 dark:text-cyan-300">Why: </span>
                                  {mcq.reason}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          onClick={() => toggleReveal(index)}
                          className={`mt-2 ml-1 font-mono text-[10px] font-medium px-2 py-1 rounded-md transition-all ${
                            revealedAnswers.has(index)
                              ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                              : 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-400/30 hover:bg-purple-100 dark:hover:bg-purple-500/25'
                          }`}
                        >
                          {revealedAnswers.has(index) ? 'HIDE_ANSWER' : 'SHOW_ANSWER'}
                        </button>
                      </div>
                    ))}

                    {mcqQuestions.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No MCQ practice for this topic yet
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

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
