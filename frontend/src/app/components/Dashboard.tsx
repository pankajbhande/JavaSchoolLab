import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig, useMotionValue, useTransform, useInView, animate } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useVisitorCount } from '../hooks/useVisitorCount';
import { Avatar } from './Avatar';
import { Link } from 'react-router-dom';
import { useAchievements } from '../hooks/useAchievements';
import { ProgressPanel } from './ProgressPanel';
import { useProgress } from '../context/ProgressContext';
import { courseStats } from '../data/courseStats';
import { useAuth } from '../context/AuthContext';
import {
  Users, Sparkles, GraduationCap, BookOpen, Award,
  FileCode2, Coffee, Boxes, Puzzle, Database, Plug, Globe, Link2, Workflow, Rocket, Atom, Network,
  Braces, Shield, Wind, AppWindow, Terminal, BrainCircuit, BarChart3, Binary,
  Compass, Cpu, Play, Layers, FileText,
} from 'lucide-react';

interface DashboardProps {
  onCourseSelect: (courseId: string) => void;
  /** Text typed in the header search box; filters the course cards. */
  searchQuery?: string;
}

// Per-subject idle animation applied to each card's icon badge, keyed by `anim`.
const iconAnimations: Record<string, { animate: Record<string, any>; transition: Record<string, any> }> = {
  // HTML/CSS - like a </> tag wiggling open and closed
  type: {
    animate: { rotate: [0, -14, 14, 0] },
    transition: { duration: 2, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' },
  },
  // Java - coffee cup jitter/baji
  brew: {
    animate: { y: [0, -3, 0, -1, 0], rotate: [0, -6, 6, 0] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
  },
  // Collection Framework - stacked layers bobbing
  stack: {
    animate: { y: [0, -4, 0] },
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
  // Design Patterns - slow continuous rotation like a gear/blueprint turning
  gear: {
    animate: { rotate: 360 },
    transition: { duration: 5, repeat: Infinity, ease: 'linear' },
  },
  // Databases - pulsing like a sync/heartbeat
  pulse: {
    animate: { scale: [1, 1.22, 1], opacity: [1, 0.75, 1] },
    transition: { duration: 1.7, repeat: Infinity, ease: 'easeInOut' },
  },
  // Servers/Microservices - radar-style ping
  ping: {
    animate: { scale: [1, 1.3, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeOut' },
  },
  // Spring Boot - page flip
  flip: {
    animate: { rotateY: [0, 180, 360] },
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  },
  // React JS - full orbit spin, echoing the React atom logo
  orbit: {
    animate: { rotate: 360 },
    transition: { duration: 3, repeat: Infinity, ease: 'linear' },
  },
};

const CATEGORY_ORDER = [
  'Foundations',
  'Web Development',
  'Core Java',
  'Python',
  'Java Enterprise & Backend',
  'Desktop Development',
  'Data Science & AI',
] as const;

const courseCards = [

  {
    id: 'software-foundations',
    name: 'Software Fundamentals',
    icon: Compass,
    color: 'from-slate-600 via-blue-600 to-indigo-700',
    glow: 'group-hover:shadow-blue-500/30',
    description: 'Core software engineering concepts',
    query: 'software engineering fundamentals',
    anim: 'gear',
    category: 'Foundations'
  },
  {
    id: 'programming-fundamentals',
    name: 'Programming Fundamentals',
    icon: Cpu,
    color: 'from-emerald-600 via-teal-600 to-cyan-700',
    glow: 'group-hover:shadow-emerald-500/30',
    description: 'Programming concepts & algorithms',
    query: 'programming fundamentals algorithms',
    anim: 'pulse',
    category: 'Foundations'
  },

  {
    id: 'HTML and CSS',
    name : 'HTML and CSS',
    icon  : FileCode2,
    color: 'from-sky-500 via-blue-500 to-indigo-600',
    glow: 'group-hover:shadow-blue-500/30',
    description: 'Html and css programming',
    query: 'html and css programming code',
    anim: 'type',
    category: 'Web Development'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: Braces,
    color: 'from-yellow-400 via-amber-500 to-orange-600',
    glow: 'group-hover:shadow-amber-500/30',
    description: 'The language of the web',
    query: 'javascript programming',
    anim: 'type',
    category: 'Web Development'
  },
  {
    id: 'react-js',
    name: 'React JS',
    icon: Atom,
    color: 'from-cyan-400 via-sky-500 to-blue-600',
    glow: 'group-hover:shadow-sky-500/30',
    description: 'Build modern user interfaces',
    query: 'react frontend',
    anim: 'orbit',
    category: 'Web Development'
  },
  {
    id: 'angular',
    name: 'Angular',
    icon: Shield,
    color: 'from-red-500 via-rose-600 to-pink-700',
    glow: 'group-hover:shadow-red-500/30',
    description: 'Build enterprise single-page apps',
    query: 'angular framework',
    anim: 'gear',
    category: 'Web Development'
  },
  {
    id: 'flutter',
    name: 'Flutter',
    icon: Wind,
    color: 'from-sky-400 via-blue-500 to-cyan-600',
    glow: 'group-hover:shadow-sky-500/30',
    description: 'Cross-platform apps from one codebase',
    query: 'flutter mobile development',
    anim: 'ping',
    category: 'Web Development'
  },

  {
    id: 'java',
    name: 'Java',
    icon: Coffee,
    color: 'from-orange-500 via-red-500 to-rose-600',
    glow: 'group-hover:shadow-orange-500/30',
    description: 'Master Java programming fundamentals',
    query: 'java programming code',
    anim: 'brew',
    category: 'Core Java'
  },
  {
    id: 'collection',
    name: 'Collection Framework',
    icon: Boxes,
    color: 'from-cyan-500 via-sky-500 to-blue-600',
    glow: 'group-hover:shadow-cyan-500/30',
    description: 'Learn Java Collections in depth',
    query: 'data structure collection',
    anim: 'stack',
    category: 'Core Java'
  },
  {
    id: 'design-patterns',
    name: 'Design Patterns',
    icon: Puzzle,
    color: 'from-fuchsia-500 via-purple-500 to-violet-600',
    glow: 'group-hover:shadow-purple-500/30',
    description: 'Understand software design patterns',
    query: 'design pattern architecture',
    anim: 'gear',
    category: 'Core Java'
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    icon: Binary,
    color: 'from-slate-500 via-gray-600 to-zinc-700',
    glow: 'group-hover:shadow-slate-500/30',
    description: 'Master DSA and problem solving',
    query: 'algorithms data structures',
    anim: 'brew',
    category: 'Core Java'
  },

  {
    id: 'mysql',
    name: 'MySQL',
    icon: Database,
    color: 'from-emerald-500 via-green-500 to-teal-600',
    glow: 'group-hover:shadow-emerald-500/30',
    description: 'Database and styling concepts',
    query: 'database mysql',
    anim: 'pulse',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'jdbc',
    name: 'JDBC',
    icon: Plug,
    color: 'from-teal-500 via-cyan-500 to-sky-600',
    glow: 'group-hover:shadow-teal-500/30',
    description: 'Java Database Connectivity',
    query: 'database connection',
    anim: 'pulse',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'jsp-servlet',
    name: 'JSP Servlet',
    icon: Globe,
    color: 'from-indigo-500 via-blue-500 to-violet-600',
    glow: 'group-hover:shadow-indigo-500/30',
    description: 'Server-side Java web technologies',
    query: 'web server technology',
    anim: 'ping',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'hibernate',
    name: 'Hibernate',
    icon: Link2,
    color: 'from-violet-500 via-purple-500 to-fuchsia-600',
    glow: 'group-hover:shadow-violet-500/30',
    description: 'Object-Relational Mapping framework',
    query: 'orm framework',
    anim: 'pulse',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'spring-mvc',
    name: 'Spring MVC',
    icon: Workflow,
    color: 'from-lime-500 via-green-500 to-emerald-600',
    glow: 'group-hover:shadow-lime-500/30',
    description: 'Model-View-Controller framework',
    query: 'spring framework',
    anim: 'ping',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'spring-boot',
    name: 'Spring Boot',
    icon: Rocket,
    color: 'from-amber-500 via-orange-500 to-red-600',
    glow: 'group-hover:shadow-amber-500/30',
    description: 'Modern Spring application development',
    query: 'spring boot application',
    anim: 'flip',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'microservices-fundamentals',
    name: 'Microservices',
    icon: Network,
    color: 'from-rose-500 via-pink-500 to-fuchsia-600',
    glow: 'group-hover:shadow-rose-500/30',
    description: 'Distributed system architecture',
    query: 'microservices architecture',
    anim: 'ping',
    category: 'Java Enterprise & Backend'
  },

  {
    id: 'spring-core',
    name: 'Spring Core',
    icon: Boxes,
    color: 'from-green-600 via-emerald-600 to-teal-700',
    glow: 'group-hover:shadow-green-500/30',
    description: 'IoC container, beans and dependency injection',
    query: 'spring core ioc',
    anim: 'stack',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'java-memory-jvm',
    name: 'Java Memory & JVM',
    icon: Cpu,
    color: 'from-sky-600 via-blue-600 to-indigo-700',
    glow: 'group-hover:shadow-sky-500/30',
    description: 'Heap, stack, garbage collection and JVM internals',
    query: 'jvm memory garbage collection',
    anim: 'pulse',
    category: 'Core Java'
  },
  {
    id: 'enterprise-patterns-1',
    name: 'Enterprise Design Patterns',
    icon: Layers,
    color: 'from-violet-600 via-purple-600 to-fuchsia-700',
    glow: 'group-hover:shadow-violet-500/30',
    description: 'Patterns for enterprise application architecture',
    query: 'enterprise patterns',
    anim: 'stack',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'microservices-patterns-1',
    name: 'Microservices Design Patterns',
    icon: Network,
    color: 'from-pink-500 via-rose-500 to-red-600',
    glow: 'group-hover:shadow-pink-500/30',
    description: 'Decomposition, data and resilience patterns',
    query: 'microservices patterns',
    anim: 'ping',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'messaging-patterns-1',
    name: 'Integration & Messaging Patterns',
    icon: Workflow,
    color: 'from-cyan-500 via-teal-500 to-emerald-600',
    glow: 'group-hover:shadow-cyan-500/30',
    description: 'Queues, events and enterprise integration',
    query: 'messaging integration patterns',
    anim: 'ping',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'architectural-patterns',
    name: 'Architectural Patterns',
    icon: Puzzle,
    color: 'from-orange-500 via-amber-500 to-yellow-600',
    glow: 'group-hover:shadow-orange-500/30',
    description: 'Layered, hexagonal, event-driven and more',
    query: 'architectural patterns',
    anim: 'gear',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'cloud-native-patterns',
    name: 'Cloud-Native Patterns',
    icon: Globe,
    color: 'from-blue-500 via-sky-500 to-cyan-600',
    glow: 'group-hover:shadow-blue-500/30',
    description: 'Patterns for building and running apps in the cloud',
    query: 'cloud native patterns',
    anim: 'ping',
    category: 'Java Enterprise & Backend'
  },
  {
    id: 'digital-image-analysis',
    name: 'Digital Image Analysis',
    icon: Sparkles,
    color: 'from-fuchsia-600 via-purple-600 to-indigo-700',
    glow: 'group-hover:shadow-fuchsia-500/30',
    description: 'Image processing and computer vision basics',
    query: 'digital image analysis',
    anim: 'pulse',
    category: 'Data Science & AI'
  },
  {
    id: 'math-foundations-cs',
    name: 'Math for Computer Science',
    icon: BarChart3,
    color: 'from-teal-600 via-cyan-600 to-sky-700',
    glow: 'group-hover:shadow-teal-500/30',
    description: 'Logic, sets, graphs and discrete mathematics',
    query: 'mathematics computer science',
    anim: 'pulse',
    category: 'Data Science & AI'
  },
  {
    id: 'javafx',
    name: 'JavaFX',
    icon: AppWindow,
    color: 'from-indigo-500 via-violet-600 to-purple-700',
    glow: 'group-hover:shadow-indigo-500/30',
    description: 'Modern Java desktop GUI apps',
    query: 'javafx desktop application',
    anim: 'flip',
    category: 'Desktop Development'
  },
  {
    id: 'python',
    name: 'Python',
    icon: Terminal,
    color: 'from-blue-500 via-indigo-500 to-yellow-500',
    glow: 'group-hover:shadow-blue-500/30',
    description: 'From fundamentals to Python internals',
    query: 'python programming',
    anim: 'stack',
    category: 'Python'
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    icon: BrainCircuit,
    color: 'from-teal-500 via-emerald-500 to-green-600',
    glow: 'group-hover:shadow-teal-500/30',
    description: 'Teach systems to learn from data',
    query: 'machine learning models',
    anim: 'pulse',
    category: 'Data Science & AI'
  },
  {
    id: 'data-science',
    name: 'Data Science',
    icon: BarChart3,
    color: 'from-fuchsia-500 via-purple-600 to-indigo-700',
    glow: 'group-hover:shadow-fuchsia-500/30',
    description: 'Turn raw data into insight',
    query: 'data science analytics',
    anim: 'orbit',
    category: 'Data Science & AI'
  },
];

const totalCourses = Object.keys(courseStats).length;
const totalTopics = Object.values(courseStats).reduce((n, c) => n + c.topics, 0);

// Scroll-triggered stagger reveal for each category grid + its cards.
const sectionVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

// Counts up from 0 to `value` once it scrolls into view.
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const display = useTransform(motionValue, (latest) => `${Math.round(latest).toLocaleString()}${suffix}`);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, value, { duration: 1.6, ease: 'easeOut' });
    return () => controls.stop();
  }, [isInView, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function Dashboard({ onCourseSelect, searchQuery = '' }: DashboardProps) {
  const { summary } = useProgress();

  // Every typed word must appear in the course name, description, category or keywords.
  const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const visibleCards = terms.length === 0
    ? courseCards
    : courseCards.filter((course) => {
        const haystack = `${course.name} ${course.description} ${course.category} ${course.query}`.toLowerCase();
        return terms.every((t) => haystack.includes(t));
      });
  const { isLoggedIn, user } = useAuth();
  const displayName = user?.fullName?.trim();
  const achievements = useAchievements();
  const { visited } = useProgress();
  const resume = summary?.resume ?? null;
  const resumeCourse = resume ? courseCards.find((c) => c.id === resume.courseId) : undefined;
  // One visit is counted when the application opens; the number then keeps itself current.
  const { count: visitorCount, loading: visitorLoading } = useVisitorCount();

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative flex-1 overflow-y-auto bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 sm:p-6 lg:p-8">
      {/* Ambient background glow — slow drifting blobs for a living, premium backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-24 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl"
          animate={{ x: [0, -30, 20, 0], y: [0, -25, 15, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 25, -25, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-7xl mx-auto"
      >
        {isLoggedIn && displayName ? (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} aria-label="Welcome" className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-3 text-left">
              <Avatar src={user?.avatar} name={displayName} className="w-12 h-12 text-xl" fallbackClassName="bg-gradient-to-br from-orange-500 to-amber-500 text-white" />
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {greeting()}, <span className="text-orange-600 dark:text-orange-400">{displayName.split(' ')[0]}</span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {achievements ? `Level ${achievements.level.number} · ${achievements.level.name}. ${achievements.level.saying}` : 'Ready to learn something new today?'}
                </p>
              </div>
            </div>
            {achievements && (
              <Link to="/achievements" aria-label={`Level ${achievements.level.number}, ${achievements.level.name}. See my badges`} className="block w-full max-w-sm rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                <div className="h-2 overflow-hidden rounded-full bg-orange-100 dark:bg-gray-700" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={achievements.level.percent} aria-label="Progress to the next level">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500" style={{ width: `${achievements.level.percent}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {achievements.level.maxed ? 'Top of the fort reached!' : `${achievements.level.xp} / ${achievements.level.toXp} XP to ${achievements.level.nextName}`} · {achievements.totalEarned} of {achievements.totalBadges} badges
                </p>
              </Link>
            )}
            {resumeCourse && (
              <button type="button" onClick={() => onCourseSelect(resumeCourse.id)}
                className="inline-flex items-center gap-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-2.5 shadow-lg shadow-orange-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                <Play className="w-4 h-4" aria-hidden="true" />
                Continue: {resumeCourse.name}
              </button>
            )}
          </motion.section>
        ) : (
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-orange-100/80 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-semibold"
          >
            <motion.span
              animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.span>
            Learn Java, Python, React &amp; More
          </motion.div>
          {isLoggedIn && displayName && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-3 inline-flex items-center gap-3 rounded-full bg-white/80 dark:bg-gray-800/70 border border-orange-200 dark:border-orange-500/30 shadow-sm backdrop-blur-sm py-1.5 pl-1.5 pr-5"
            >
              <Avatar src={user?.avatar} name={displayName} className="w-10 h-10 text-lg" fallbackClassName="bg-gradient-to-br from-orange-500 to-amber-500 text-white" />
              <p className="font-display text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Hi, <span className="text-orange-600 dark:text-orange-400">{displayName}</span>
              </p>
            </motion.div>
          )}
          <motion.h1
            className="font-display text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent tracking-tight bg-[length:200%_auto]"
            initial={{ opacity: 0, scale: 0.9, backgroundPositionX: '0%' }}
            animate={{ opacity: 1, scale: 1, backgroundPositionX: ['0%', '100%', '0%'] }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              backgroundPositionX: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            Welcome to JavaSchoolLab
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-sm md:text-base text-gray-700 dark:text-gray-300"
          >
            Choose a course to begin your learning journey
          </motion.p>
          {resumeCourse && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              onClick={() => onCourseSelect(resumeCourse.id)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-2.5 shadow-lg shadow-orange-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              <Play className="w-4 h-4" aria-hidden="true" />
              Continue learning: {resumeCourse.name}
            </motion.button>
          )}
        </div>
        )}

        <ProgressPanel />


        {terms.length > 0 && visibleCards.length === 0 && (
          <p role="status" className="text-center text-gray-600 dark:text-gray-300 py-12">
            No course matches &ldquo;{searchQuery.trim()}&rdquo;. Try another word, e.g. Python, MySQL or React.
          </p>
        )}

        <div id="course-catalog" className="space-y-10 scroll-mt-4">
          {CATEGORY_ORDER.map((category) => {
            const coursesInCategory = visibleCards.filter((course) => course.category === category);
            if (coursesInCategory.length === 0) return null;

            return (
              <div key={category}>
                <motion.div
                  className="flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="font-display text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                    {category}
                  </h2>
                  <motion.div
                    className="h-px flex-1 bg-gradient-to-r from-orange-300/60 dark:from-orange-500/30 to-transparent origin-left"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  variants={sectionVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.15 }}
                >
                  {coursesInCategory.map((course) => (
                    <motion.button
                      type="button"
                      key={course.id}
                      aria-label={`${course.name}: ${course.description}${courseStats[course.id] ? `, ${courseStats[course.id].modules} modules, ${courseStats[course.id].topics} topics` : ''}`}
                      variants={cardVariants}
                      whileHover={{ scale: 1.05, y: -6, transition: { type: 'spring', stiffness: 320, damping: 18 } }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onCourseSelect(course.id)}
                      className="group cursor-pointer block w-full text-left rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600"
                    >
                      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-2xl group-focus-visible:shadow-2xl group-hover:border-orange-300 dark:group-hover:border-orange-500/60 ${course.glow} transition-shadow duration-300 overflow-hidden border border-gray-200/70 dark:border-gray-700/70`}>
                        <div className={`h-24 bg-gradient-to-br ${course.color} relative overflow-hidden`}>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />
                          {/* Diagonal light sweep on hover */}
                          <div className="absolute inset-0 -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none" />
                          <div className="absolute top-2.5 right-2.5 bg-white/20 backdrop-blur-sm rounded-full p-1.5 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                            <motion.div
                              animate={iconAnimations[course.anim].animate}
                              transition={iconAnimations[course.anim].transition}
                            >
                              <course.icon className="w-4 h-4 text-white" />
                            </motion.div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-2.5 left-3">
                            <h3 className="font-display text-white text-sm font-bold leading-tight drop-shadow-sm">{course.name}</h3>
                          </div>
                        </div>

                        <div className="px-3 py-2.5">
                          {(() => {
                            // Only meaningful once there is server-side progress to draw from.
                            const total = courseStats[course.id]?.topics ?? 0;
                            const seen = summary?.byCourse?.[course.id] ?? 0;
                            if (!summary || total === 0 || seen === 0) return null;
                            const pct = Math.min(100, Math.round((seen / total) * 100));
                            return (
                              <div className="mb-1.5">
                                <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-300 mb-0.5">
                                  <span>{seen}/{total} topics</span>
                                  <span className="tabular-nums">{pct}%</span>
                                </div>
                                <div role="progressbar" aria-label={`${course.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="w-full h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                  <div
                                    className={pct === 100
                                      ? 'h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500'
                                      : 'h-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-400'}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })()}
                          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 min-h-[2rem]">
                            {course.description}
                          </p>
                          {courseStats[course.id] && (
                            <p className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-600 dark:text-gray-400 tabular-nums">
                              <span className="inline-flex items-center gap-1"><Layers className="w-3 h-3" aria-hidden="true" />{courseStats[course.id].modules} modules</span>
                              <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" aria-hidden="true" />{courseStats[course.id].topics} topics</span>
                            </p>
                          )}
                          <span className="mt-1.5 text-xs text-orange-700 dark:text-orange-300 font-semibold flex items-center gap-1 py-0.5 group-hover:translate-x-1 transition-transform motion-reduce:transition-none">
                            Start Learning <span aria-hidden="true">→</span>
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>

        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 18 } }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-200/60 dark:border-gray-700/60 hover:shadow-xl transition-shadow duration-300"
          >
            <motion.div
              className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/20"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Users className="w-7 h-7 text-white" />
            </motion.div>
            {visitorLoading ? (
              <div className="h-9 w-20 mx-auto mb-2 rounded-md bg-purple-100 dark:bg-purple-900/30 animate-pulse" />
            ) : (
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent mb-2">
                <AnimatedCounter value={visitorCount} />
              </div>
            )}
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Visitors</div>
          </motion.div>
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 18 } }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-200/60 dark:border-gray-700/60 hover:shadow-xl transition-shadow duration-300"
          >
            <motion.div
              className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            >
              <BookOpen className="w-7 h-7 text-white" />
            </motion.div>
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent mb-2">
              <AnimatedCounter value={totalCourses} />
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Comprehensive Courses</div>
          </motion.div>
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 18 } }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-200/60 dark:border-gray-700/60 hover:shadow-xl transition-shadow duration-300"
          >
            <motion.div
              className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            >
              <GraduationCap className="w-7 h-7 text-white" />
            </motion.div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
              <AnimatedCounter value={totalTopics} />
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Topics Covered</div>
          </motion.div>
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 18 } }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-200/60 dark:border-gray-700/60 hover:shadow-xl transition-shadow duration-300"
          >
            <motion.div
              className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
            >
              <Award className="w-7 h-7 text-white" />
            </motion.div>
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent mb-2">Free</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Certifications</div>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs text-gray-600 dark:text-gray-400 mt-10"
        >
          JavaSchoolLab is an official product of DHIPAN Software Technologies Private Limited.
        </motion.p>
      </motion.div>
    </div>
    </MotionConfig>
  );
}
