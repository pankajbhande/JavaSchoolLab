import { useState, useRef, useEffect } from 'react';
import type { Course, Topic, ContentBlock } from '../data/types';
import { Copy, Check, Award, Image as ImageIcon, Layers, Code, ChevronRight, ChevronDown, Bot, Volume2, VolumeX, Clock, Lightbulb } from 'lucide-react';
import { MCQTest } from './MCQTest';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TopicVisual } from './TopicVisual';
import { transformContentTables } from '../lib/qaTables';
import { formatNotes } from '../lib/notes';
import { allBanks } from '../data/quiz';
import { findBankIn } from '../lib/quizBanks';
import { useDataset } from '../hooks/useDataset';
import type { QuizBank } from '../data/quiz/types';
import { TopicToolbar } from './TopicToolbar';
import { withJavaPackage } from '../lib/javaPackage';
import { ReadingControls } from './shell/ReadingControls';
import { useReadingPrefs } from '../hooks/useReadingPrefs';
import { FONT_SCALES } from '../lib/readingPrefs';
interface ContentAreaProps {
  course: Course | null;
  topic: Topic | null;
  contentRef: React.RefObject<HTMLDivElement>;
  topRef?: React.RefObject<HTMLDivElement>;
  onTopicSelect?: (topicId: string) => void;
  onPrevTopic: () => void;
  onNextTopic: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  prevTopicName?: string;
  nextTopicName?: string;
  isSpeaking?: boolean;
  onToggleSpeech?: () => void;
  voiceGender?: 'male' | 'female';
  onVoiceChange?: (gender: 'male' | 'female') => void;
  /** Focus mode hides both side panes (owned by the workspace). */
  focusMode?: boolean;
  onToggleFocus?: () => void;
  /** Optional mount point rendered directly below the lesson notes, above Previous/Next. */
  extraBelowNotes?: React.ReactNode;
}

const handleAction = (code: string) => {
  localStorage.setItem("java_try_code", code);
  window.open("/java-compiler.html", "_blank");   // served from public/, so it also exists in production builds
};

// Eclipse/STS-style Java syntax highlighting
function highlightJava(code: string): string {
  const tokens: { text: string; type: string }[] = [];
  let i = 0;
  // In Python `//` is floor division, not a comment. A snippet with `# ` comment lines and
  // no statement-ending semicolons is treated as Python so `7 // 2` isn't greyed out.
  const isPython = /^\s*#\s/m.test(code) && !/;\s*$/m.test(code);

  while (i < code.length) {
    // Multi-line comments
    if (!isPython && code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const j = end === -1 ? code.length : end + 2;
      tokens.push({ text: code.slice(i, j), type: 'comment' });
      i = j;
    }
    // Single-line comments
    else if (!isPython && code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const j = end === -1 ? code.length : end;
      tokens.push({ text: code.slice(i, j), type: 'comment' });
      i = j;
    }
    // Python/Ruby/shell-style single-line comments
    else if (code[i] === '#') {
      const end = code.indexOf('\n', i);
      const j = end === -1 ? code.length : end;
      tokens.push({ text: code.slice(i, j), type: 'comment' });
      i = j;
    }
    // Strings
    else if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') { if (code[j] === '\\') j++; j++; }
      j = Math.min(j + 1, code.length);
      tokens.push({ text: code.slice(i, j), type: 'string' });
      i = j;
    }
    // Single-quoted literals: Java chars ('a', '\n') and Python/JS strings ('hello').
    // Scans to the closing quote on the same line; a stray apostrophe stays plain text.
    else if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'" && code[j] !== '\n') { if (code[j] === '\\') j++; j++; }
      if (code[j] === "'") {
        tokens.push({ text: code.slice(i, j + 1), type: 'string' });
        i = j + 1;
      } else {
        tokens.push({ text: "'", type: 'plain' });
        i++;
      }
    }
    // Annotations
    else if (code[i] === '@' && /[a-zA-Z]/.test(code[i + 1] || '')) {
      let j = i + 1;
      while (j < code.length && /\w/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), type: 'annotation' });
      i = j;
    }
    // Words (identifiers/keywords)
    else if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\w$]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), type: 'word' });
      i = j;
    }
    // Numbers
    else if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.xXa-fA-FLlFf]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), type: 'number' });
      i = j;
    }
    // Everything else
    else {
      tokens.push({ text: code[i], type: 'plain' });
      i++;
    }
  }

  const kwSet = new Set(['package','import','public','private','protected','class','interface','extends','implements',
    'static','final','abstract','synchronized','volatile','transient','native','strictfp',
    'void','int','long','short','byte','float','double','char','boolean',
    'new','return','if','else','for','while','do','switch','case','break','continue','default',
    'try','catch','finally','throw','throws','this','super','null','true','false',
    'instanceof','enum','assert','var','record','sealed','permits','yield',
    // Python
    'def','elif','except','from','as','with','lambda','pass','raise','global','nonlocal',
    'del','and','or','not','in','is','None','True','False','async','await','self','print',
    // JS/TS (shared keywords already covered above: new, return, if, else, for, while, try, catch, finally, this, throw)
    'function','const','let','export','extends','typeof','instanceof','of']);

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return tokens.map(t => {
    const e = esc(t.text);
    switch (t.type) {
      case 'comment': return `<span style="color:#6A9955;font-style:italic">${e}</span>`;
      case 'string': return `<span style="color:#CE9178">${e}</span>`;
      case 'annotation': return `<span style="color:#D4D4AA">${e}</span>`;
      case 'number': return `<span style="color:#B5CEA8">${e}</span>`;
      case 'word':
        if (kwSet.has(t.text)) return `<span style="color:#CC7832;font-weight:bold">${e}</span>`;
        if (/^[A-Z]/.test(t.text)) return `<span style="color:#4EC9B0">${e}</span>`;
        return e;
      default: return e;
    }
  }).join('');
}


/**
 * Re-indent a code sample for display.
 *
 * Much of the course content was pasted in flat, with every line at a single space, which
 * renders as an unreadable block. This restores the nesting from the brace depth.
 *
 * Two things it deliberately does NOT do: it leaves any sample that is already indented
 * (two spaces or more anywhere) completely untouched, so hand-formatted HTML and CSS
 * samples are byte-for-byte unchanged; and it ignores braces inside string literals and
 * comments, so a line like System.out.println("a { brace }") does not shift the level.
 */
function formatCode(code: string): string {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  // Anything already indented by a human or a formatter is left untouched.
  const widths = lines.filter(l => l.trim()).map(l => l.length - l.trimStart().length);
  if (widths.some(n => n >= 2)) return code;

  let depth = 0;
  const out: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { out.push(''); continue; }

    // Braces inside strings and comments must not move the indent level.
    const bare = line
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/, '');

    const opens = (bare.match(/[{[(]/g) || []).length;
    const closes = (bare.match(/[}\])]/g) || []).length;
    const lead = (bare.match(/^[}\])]+/) || [''])[0].length;

    depth = Math.max(0, depth - lead);
    out.push('    '.repeat(depth) + line);
    depth = Math.max(0, depth + (opens - closes) + lead);
  }
  return out.join('\n');
}

/**
 * Split a code identifier into readable words: SumOfArray -> "Sum Of Array",
 * HTTPClientDemo -> "HTTP Client Demo".
 */
function splitIdentifier(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([A-Za-z])([0-9])/g, '$1 $2')
    .trim();
}

/**
 * A human title for one code sample, shown above the block.
 *
 * The course data stores samples as bare strings with no title of their own, so it is
 * derived from the code: the Java class name, or the document title for the HTML and CSS
 * course. Without this a topic like "Array Program", which ships 40+ samples in a row,
 * renders as an unlabelled wall of code and the reader cannot tell one program from the
 * next or link to the one they want.
 */
function codeTitle(code: string, index: number): string {
  const cls = code.match(
    /\b(?:public\s+|final\s+|abstract\s+|static\s+)*(?:class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/
  );
  if (cls) return splitIdentifier(cls[1]);

  const docTitle = code.match(/<title>([^<]{1,80})<\/title>/i);
  if (docTitle && docTitle[1].trim()) return docTitle[1].trim();

  return 'Example ' + (index + 1);
}

/**
 * Proper names for a block's examples: when the text above them is a list with exactly one item per
 * example ("Sum of array elements", "Reverse an array", ...), those items are the names.
 */
function listedExampleNames(html: string, count: number): string[] | null {
  const list = html.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/i);
  if (!list) return null;
  const items = [...list[1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim());
  return items.length === count && items.every(Boolean) ? items : null;
}

/** "Example 1: Count Even Odd" - the number plus the derived name (just "Example 1" when there is no name). */
function exampleLabel(title: string, index: number): string {
  const generic = 'Example ' + (index + 1);
  return title === generic ? generic : `${generic}: ${title}`;
}

/** A block with exactly one example puts its show/hide button at the top right, over the block's heading row (the heading leaves room, the text below runs full width), instead of a title row. */
const hasSingleExample = (c: { codeExamples?: unknown[] }) => c.codeExamples?.length === 1;

/**
 * The top-right button only makes sense when the code sits right under it: a short block (heading plus a
 * line or two, no diagram or list in between). A long block just shows its code, with no button.
 */
const hasInlineToggle = (c: { content: string; codeExamples?: unknown[] }) =>
  hasSingleExample(c) && !/<(pre|ul|ol|table)\b/i.test(c.content) && c.content.replace(/<[^>]+>/g, '').length <= 400;

function ExampleToggle({ open, onClick, className = '' }: { open: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700/50 text-orange-800 dark:text-orange-300 text-xs font-semibold hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors ${className}`}
      aria-expanded={open}
    >
      <Code className="w-3.5 h-3.5" />
      {open ? 'Hide Example' : 'Example With Proof'}
      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function ContentArea({
  course,
  topic,
  contentRef,
  topRef,
  onTopicSelect,
  onPrevTopic,
  onNextTopic,
  nextTopicName,
  prevTopicName,
  hasPrev,
  hasNext,
  isSpeaking = false,
  onToggleSpeech,
  voiceGender = 'female',
  onVoiceChange,
  focusMode = false,
  onToggleFocus,
  extraBelowNotes,
}: ContentAreaProps) {
  const [reading, setReading] = useReadingPrefs();

  // Esc leaves focus mode (unless a dialog or popover is open and wants the key first).
  useEffect(() => {
    if (!focusMode || !onToggleFocus) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (document.querySelector('[aria-modal="true"], [aria-label="Reading controls"][role="dialog"]')) return;
      onToggleFocus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusMode, onToggleFocus]);
  const progressRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showMCQ, setShowMCQ] = useState(false);
  const [openExplanations, setOpenExplanations] = useState<Set<string>>(new Set());

  const toggleExplanation = (key: string) => {
    setOpenExplanations(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // "Example With Proof": every example starts open. `flippedExamples` holds the ones the reader has hidden.
  const [flippedExamples, setFlippedExamples] = useState<Set<string>>(new Set());
  const toggleExample = (key: string) => {
    setFlippedExamples(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Find the current module (subtopic) that the selected topic belongs to
  const currentModule = course?.subTopics.find(st =>
    st.topics.some(t => t.id === topic?.id)
  );

  // Only modules with a reviewed question bank can award a certificate, so the button
  // says what it will actually do rather than promising one everywhere.
  // In api mode the banks arrive from the server: until they do, the button is disabled and says so,
  // so it never flips from "coming soon" to "Take Test". Bundle mode is synchronous, as before.
  const { data: banks, status: banksStatus } = useDataset<QuizBank[]>('quiz-banks', allBanks);
  const testAvailable = !!banks && !!findBankIn(banks, currentModule?.id, course?.id);
  const testLoading = banksStatus === 'loading';


  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div className="text-center max-w-2xl px-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Welcome to JavaSchoolLab</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your comprehensive guide to mastering Java, Python, web development, and enterprise technologies
          </p>
          <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-6">
            <p className="text-orange-800 dark:text-orange-300 font-medium">Select a course to get started</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div className="text-center max-w-2xl px-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Welcome to JavaSchoolLab</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Your comprehensive guide to mastering Java, Python, web development, and enterprise technologies
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-8 max-w-md mx-auto">
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Basics to Expert</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Every topic in one place</p>
            </motion.div>
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">Interview Ready</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real questions and worked examples</p>
            </motion.div>
          </div>

          <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-6">
            <p className="text-orange-800 dark:text-orange-300 font-medium mb-2">Select a topic from the sidebar to get started</p>
            <p className="text-orange-700 dark:text-orange-400 text-sm">
              Explore topics, read tutorials, use cheat sheets, and prepare for interviews with company-specific questions
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // One single level. The Basic/Expert split was removed: every topic now shows all of
  // its content in one pass, foundations first and advanced material after, so a student
  // never has to discover that half the lesson was hidden behind a second tab.
  const contentBlocks: ContentBlock[] = [
    ...(topic.beginner || []),
    ...(topic.intermediate || []),
    ...(topic.expert || []),
  ];

  // Auto-computed read time (~200 words/min) — no manual tagging needed per topic
  const readMinutes = (() => {
    const wordsIn = (text: string) => text.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    const total = contentBlocks.reduce((sum, block) => {
      const contentWords = wordsIn(block.content || '');
      const codeWords = (block.codeExamples || []).reduce((s, c) => s + wordsIn(c), 0);
      return sum + contentWords + codeWords;
    }, 0);
    return Math.max(1, Math.round(total / 200));
  })();


  return (
    <div
      onScroll={(e) => {
        const el = e.currentTarget;
        const max = el.scrollHeight - el.clientHeight;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, el.scrollTop / max) : 0})`;
      }}
      data-tour="notes"
      data-rd-theme={reading.theme}
      data-rd-width={reading.width}
      data-rd-scale={reading.fontStep === 1 ? undefined : String(reading.fontStep)}
      style={{ '--rd-scale': FONT_SCALES[reading.fontStep] } as React.CSSProperties}
      className="reading-root flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-orange-50/50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 custom-scrollbar"
    >
      <div className="sticky top-0 z-30 h-1 -mb-1 pointer-events-none" aria-hidden="true">
        <div ref={progressRef} className="h-full origin-left bg-gradient-to-r from-orange-600 to-amber-400" style={{ transform: 'scaleX(0)' }} />
      </div>
      {focusMode && onToggleFocus && (
        <div className="sticky top-2 z-30 h-0 flex justify-end pr-3">
          <button
            type="button"
            onClick={onToggleFocus}
            className="h-9 rounded-full bg-gray-900/85 px-4 text-xs font-semibold text-white shadow-lg backdrop-blur hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-white/90 dark:text-gray-900 dark:hover:bg-white"
          >
            Exit focus mode <span className="opacity-70">(Esc)</span>
          </button>
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-6 py-1" ref={topRef}>
        {/* Difficulty Tabs + Robo Guru + Take Test — merged into a single responsive row */}
        {/* Stacked deliberately: level tabs first, Robo Guru second, topic heading third.
            All three previously shared one wrapping row, where they collided - the test
            CTA overlapped the Robo card and "Robo Guru" broke onto two clipped lines. */}
        <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-2">

          {/* Row 1 — Robo Guru, given the full width so nothing has to be truncated */}
          {/* Robo Guru — Indian voice teacher (kept outside contentRef so its own labels aren't read aloud) */}
          {onToggleSpeech && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full min-w-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-orange-200/80 dark:border-orange-800/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 px-4 py-2.5 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center border-2 border-orange-500 shadow-sm">
                  <Bot className="w-5 h-5 text-gray-700" />
                  {isSpeaking && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.15, 0.6] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full bg-orange-400"
                    />
                  )}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="font-display font-semibold text-orange-800 dark:text-orange-300 text-sm leading-tight tracking-tight whitespace-nowrap">Robo Guru</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate leading-snug">
                    {isSpeaking ? 'Explaining this topic in Indian voice…' : 'Tap play to hear this topic explained aloud'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                {/* While Robo Guru speaks only the Stop button is offered: the voice cannot change mid-sentence. */}
                {onVoiceChange && !isSpeaking && (
                  <div className="hidden md:flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 border border-orange-200 dark:border-orange-800/50">
                    <button
                      onClick={() => onVoiceChange('female')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${voiceGender === 'female'
                        ? 'bg-orange-500 text-white font-semibold shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}
                      title="Indian Girl Voice"
                      aria-label="Indian Girl Voice"
                    >
                      Girl Voice
                    </button>
                    <button
                      onClick={() => onVoiceChange('male')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${voiceGender === 'male'
                        ? 'bg-orange-500 text-white font-semibold shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}
                      title="Indian Boy Voice"
                      aria-label="Indian Boy Voice"
                    >
                      Boy Voice
                    </button>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleSpeech}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm ${isSpeaking
                    ? 'bg-orange-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:shadow-md'
                    }`}
                  title={isSpeaking ? 'Stop Robo Guru' : 'Let Robo Guru explain this topic'}
                  aria-label={isSpeaking ? 'Stop Robo Guru' : 'Let Robo Guru explain this topic'}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isSpeaking ? 'Stop' : 'Explain This Topic'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Test CTA — sits on the topic-title row, floated right. Kept outside contentRef so
            its label isn't read aloud. */}
        <div className="mt-1 mb-3 flex flex-wrap items-center justify-end gap-2 sm:float-right sm:ml-3 sm:mb-0 sm:flex-nowrap">
          <ReadingControls prefs={reading} onChange={setReading} focusMode={focusMode} onToggleFocus={onToggleFocus} />
          <TopicToolbar
            topicRef={{
              courseId: course.id,
              moduleId: course.subTopics.find(st => st.topics.some(t => t.id === topic.id))?.id ?? course.id,
              topicId: topic.id,
              topicName: topic.name,
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMCQ(true)}
            disabled={testLoading}
            aria-busy={testLoading || undefined}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg flex items-center gap-2 font-display font-semibold text-sm tracking-tight shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-wait"
          >
            <Award className="w-5 h-5" />
            {testLoading ? "Checking assessment…" : testAvailable ? "Take Test & Get Certificate" : "Assessment coming soon"}
          </motion.button>
        </div>

        {/* Everything the Robo Guru reads aloud lives inside this ref — title + actual topic content only */}
        <div ref={contentRef}>
        {/* Topic Title + animated visual + read time */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <TopicVisual topicId={topic.id} topicName={topic.name} />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{topic.name}</h1>
            <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {readMinutes} min read
            </div>
          </div>
        </motion.div>

        {contentBlocks.length > 0 ? (
          contentBlocks.map((content, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative mb-3 pl-5 border-l-2 border-orange-200 dark:border-orange-800/40"
            >
              {/* Point marker — helps students track "one point at a time" */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.15, type: 'spring', stiffness: 300 }}
                className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-gray-800 shadow"
              />

              {/* Content Text */}
              <div className={hasInlineToggle(content) ? 'relative [&_.topic-content>div>:first-child]:pr-44' : undefined}>
              <div className="prose max-w-none mb-1 topic-content">
                {/<[a-z][\s\S]*>/i.test(content.content) ? (
                  <div dangerouslySetInnerHTML={{ __html: formatNotes(transformContentTables(content.content)) }} />
                ) : (
                  content.content.split('\n\n').map((paragraph, index) => {
                    // Same paragraph parsing logic
                    if (paragraph.startsWith('•')) {
                      const items = paragraph.split('\n').filter(item => item.trim());
                      return (
                        <motion.ul
                          key={index}
                          initial="hidden"
                          animate="show"
                          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                          className="list-disc list-inside space-y-2 my-2"
                        >
                          {items.map((item, idx2) => (
                            <motion.li
                              key={idx2}
                              variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                              transition={{ duration: 0.3 }}
                              className="text-gray-700 dark:text-gray-300"
                            >
                              {item.replace('•', '').trim()}
                            </motion.li>
                          ))}
                        </motion.ul>
                      );
                    }

                    if (/^\d+\./.test(paragraph)) {
                      const items = paragraph.split('\n').filter(item => item.trim());
                      return (
                        <motion.ol
                          key={index}
                          initial="hidden"
                          animate="show"
                          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                          className="list-decimal list-inside space-y-2 my-4"
                        >
                          {items.map((item, idx2) => (
                            <motion.li
                              key={idx2}
                              variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                              transition={{ duration: 0.3 }}
                              className="text-gray-700 dark:text-gray-300"
                            >
                              {item.replace(/^\d+\./, '').trim()}
                            </motion.li>
                          ))}
                        </motion.ol>
                      );
                    }

                    if (paragraph.includes(':') && paragraph.length < 100) {
                      return (
                        <h3
                          key={index}
                          className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3"
                        >
                          {paragraph}
                        </h3>
                      );
                    }

                    return (
                      <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    );
                  })
                )}
              </div>
              {hasInlineToggle(content) && (
                <ExampleToggle
                  open={!flippedExamples.has(`${topic?.id}-${idx}-0`)}
                  onClick={() => toggleExample(`${topic?.id}-${idx}-0`)}
                  className="absolute top-1 right-0"
                />
              )}
              </div>

              {/* Code Examples */}
              {content.codeExamples && content.codeExamples.length > 0 && (
                <div className="space-y-4">
                  {content.codeExamples.map((rawCode, codeIdx) => {
                    const code = withJavaPackage(formatCode(rawCode), course.id, topic.id);
                    const explanation = content.codeExplanations?.[codeIdx];
                    const explanationKey = `${idx}-${codeIdx}`;
                    const isExplanationOpen = openExplanations.has(explanationKey);
                    const exampleKey = `${topic?.id}-${idx}-${codeIdx}`;
                    // a long single-example block has no button, so its code is always shown
                    const isExampleOpen = !flippedExamples.has(exampleKey) || (hasSingleExample(content) && !hasInlineToggle(content));
                    return (
                    <motion.div
                      key={codeIdx}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: codeIdx * 0.08, ease: 'easeOut' }}
                      className="relative"
                    >
                      {/* Every sample gets a heading derived from the code itself, so a
                          page of many programs reads as a labelled list rather than an
                          undifferentiated wall of code. */}
                      {!hasSingleExample(content) && (
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-semibold text-base text-gray-800 dark:text-gray-200 min-w-0 flex-1">
                          {exampleLabel(listedExampleNames(content.content, content.codeExamples!.length)?.[codeIdx] ?? codeTitle(code, codeIdx), codeIdx)}
                        </h3>
                        <ExampleToggle open={isExampleOpen} onClick={() => toggleExample(exampleKey)} />
                      </div>
                      )}

                      <AnimatePresence initial={false}>
                      {isExampleOpen && (
                      <motion.div
                        key="example"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`overflow-hidden${hasSingleExample(content) ? ' mt-2' : ''}`}
                      >
                      <div className="relative">
                      <div className="absolute top-2 right-2 z-10 flex gap-2">
                        {/* Copy button */}
                        <button
                          onClick={() => copyToClipboard(code, codeIdx)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                        >
                          {copiedIndex === codeIdx ? <Check /> : <Copy />}
                        </button>

                        {/* ⭐ Your new button */}
                        <button
                          onClick={() => handleAction(code)}
                          className="p-2 bg-orange-600 hover:bg-orange-500 rounded-md text-white text-sm font-semibold"
                        >
                        Try it
                        
                        </button>
                      </div>

                      <pre className="bg-[#1e1e2e] text-gray-100 p-5 rounded-lg overflow-x-auto border border-gray-700/50 shadow-lg font-mono text-[13px] leading-6">
                        <code dangerouslySetInnerHTML={{ __html: highlightJava(code) }} />
                      </pre>
                      </div>

                      {/* Explanation of Code — collapsed by default, click to read then close */}
                      {explanation && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleExplanation(explanationKey)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                            aria-expanded={isExplanationOpen}
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            Explanation of Code
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExplanationOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isExplanationOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-2 p-3 rounded-md bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {explanation}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      </motion.div>
                      )}
                      </AnimatePresence>
                    </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-300">
              Content for this topic is coming soon.
            </p>
          </div>
        )}
        </div>

      </div>

      {/* MCQ Test Modal */}
      {showMCQ && currentModule && (
        <MCQTest
          moduleId={currentModule.id}
          courseId={course.id}
          moduleName={currentModule.name}
          courseName={course.name}
          onClose={() => setShowMCQ(false)}
        />
      )}

      {extraBelowNotes && (
        <div className="container mx-auto px-4 sm:px-6">{extraBelowNotes}</div>
      )}

     {/* Previous / Next Topic Navigation */}
<div className="mt-12 flex justify-between items-center border-t pt-4 gap-4 p-2">

  {/* Previous */}
  <button
    onClick={onPrevTopic}
    disabled={!hasPrev}
    className={`text-center px-6 py-4 rounded-xl transition
      ${hasPrev
        ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
        : 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800'}
    `}
  >
    <p className="text-sm text-gray-500 ">⬅ Previous</p>
    <p className="font-semibold text-gray-800 dark:text-gray-200 ">
      {prevTopicName || '—'}
    </p>
  </button>

  {/* Next */}
  <button
    onClick={onNextTopic}
    disabled={!hasNext}
    className={`text-center px-6 py-4 rounded-xl transition
      ${hasNext
        ? 'bg-orange-500 text-white hover:bg-orange-500'
        : 'opacity-40 cursor-not-allowed bg-orange-300'}
    `}
  >
    <p className="text-sm opacity-90">Next ➡</p>
    <p className="font-semibold">
      {nextTopicName || '—'}
    </p>
  </button>

</div>


    </div>
  );
}