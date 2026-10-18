// The course workspace: header + course strip + sidebars + content area.
//
// This lives in its own module so it can be lazy-loaded. It works from the course index
// (names only) and fetches a course's content when that course is opened (see useCourses),
// so neither /dashboard nor the first lesson pays for the whole library.

import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { RightSidebar } from './components/RightSidebar';
import { CornerAd } from './components/ads/CornerAd';
import { Dashboard } from './components/Dashboard';
import { TopicsBar } from './components/TopicsBar';
import { SearchResults } from './components/SearchResults';
import { useCourses, skeletonCourses } from './hooks/useCourses';
import { slugify } from './lib/slug';
import { useProgress } from './context/ProgressContext';
import { useMediaQuery, DESKTOP_QUERY } from './hooks/useMediaQuery';
import { useFocusTrap } from './hooks/useFocusTrap';
import { useDocumentMeta, toDescription } from './hooks/useDocumentMeta';
import { PanelLeft, PanelRight, X, Search } from 'lucide-react';
import { courseStats } from './data/courseStats';
import { buildSpeechScript, prosody } from './lib/speechScript';
import { useTheme } from './components/ThemeProvider';
import { CommandPalette, type PaletteAction } from './components/shell/CommandPalette';
import { ShortcutsSheet } from './components/shell/ShortcutsSheet';
import { OnboardingTour, isTourDone } from './components/shell/OnboardingTour';
import { resolveShortcut, isTypingTarget, type ShortcutAction } from './lib/shortcuts';
import { pushRecent } from './lib/recentTopics';

// courseStats.ts is generated (npm run gen:course-stats) and feeds the dashboard rings.
// The dashboard cannot import the course data without undoing the code split, so this is the
// one place both are in scope - assert they agree rather than let the rings drift.
if (import.meta.env.DEV) {
  for (const course of skeletonCourses) {
    const expected = course.subTopics.reduce((a, s) => a + s.topics.length, 0);
    const actual = courseStats[course.id];
    if (!actual) console.error('[courseStats] missing course:', course.id, '- run npm run gen:course-stats');
    else if (actual.topics !== expected) console.error('[courseStats] stale count for', course.id, actual.topics, '!=', expected, '- run npm run gen:course-stats');
  }
}

/** Shown while a course (or, for search, every course) is being downloaded. */
function LoadingPane({ label, error, onRetry }: { label: string; error: string | null; onRetry: () => void }) {
  return (
    <div className="flex-1 grid place-items-center p-8 text-center" role="status" aria-live="polite">
      {error ? (
        <div className="max-w-sm">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300" role="alert">{error}</p>
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300">
          <span className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 motion-safe:animate-spin" aria-hidden="true" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}

export default function CourseWorkspace() {
  const navigate = useNavigate();
  const { courseId, subTopicId: subTopicIdParam, topicId: topicIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {
    if (!courseId) return null;
    return skeletonCourses.find(c => c.id === courseId || slugify(c.id) === courseId)?.id || null;
  });
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string | null>(() => {
    const course = skeletonCourses.find(c => c.id === courseId || slugify(c.id) === courseId);
    if (!course || !topicIdParam) return null;
    const directMatch = course.subTopics.find(st => st.id === subTopicIdParam || slugify(st.id) === subTopicIdParam);
    const parentSubTopic = directMatch?.topics.some(t => t.id === topicIdParam || slugify(t.id) === topicIdParam)
      ? directMatch
      : course.subTopics.find(st => st.topics.some(t => t.id === topicIdParam || slugify(t.id) === topicIdParam));
    return parentSubTopic?.id || null;
  });
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(() => {
    const course = skeletonCourses.find(c => c.id === courseId || slugify(c.id) === courseId);
    if (!course || !topicIdParam) return null;
    for (const st of course.subTopics) {
      const topic = st.topics.find(t => t.id === topicIdParam || slugify(t.id) === topicIdParam);
      if (topic) return topic.id;
    }
    return null;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Content for the open course; every course once the reader searches lesson text.
  const catalog = useCourses(selectedCourseId, searchQuery.trim().length >= 2);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [leftSidebarMinimized, setLeftSidebarMinimized] = useState(false);
  const [rightSidebarMinimized, setRightSidebarMinimized] = useState(false);
  // Visited topics are owned by ProgressContext now: server-backed when signed in,
  // localStorage while browsing as a guest, and migrated across on sign-in.
  const { visited: visitedTopics, markVisited } = useProgress();
  // Below lg the three panes cannot coexist, so the sidebars become overlay drawers.
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [mobileDrawer, setMobileDrawer] = useState<null | "contents" | "notes">(null);
  const drawerRef = useFocusTrap<HTMLDivElement>(!!mobileDrawer);
  // The header search box is hidden below md, so without this there is no way to reach
  // full-text search on a phone at all.
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const { toggleTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tourRun, setTourRun] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechRunRef = useRef(0);
  const speechPauseRef = useRef<number | null>(null);

  // Sync URL param to state — matched via slugify() since the URL segment may be a slug
  // (spaces -> underscores) rather than the real id.
  useEffect(() => {
    if (!courseId) {
      setSelectedCourseId(null);
      return;
    }
    const course = skeletonCourses.find(c => c.id === courseId || slugify(c.id) === courseId);
    if (course && course.id !== selectedCourseId) setSelectedCourseId(course.id);
  }, [courseId]);

  // Sync the /course/:courseId/:subTopicId/:topicId URL params to state — handles a direct
  // visit/refresh on a deep topic URL, and browser back/forward navigation between topics.
  useEffect(() => {
    if (!topicIdParam) return;
    const course = skeletonCourses.find(c => c.id === courseId || slugify(c.id) === courseId);
    if (!course) return;
    // Trust the subTopicId segment in the URL if it actually contains the topic; otherwise
    // (e.g. an old-style /course/:courseId/:topicId link, or a stale segment) fall back to
    // resolving the topic's real parent subtopic by searching the course data.
    const directMatch = course.subTopics.find(st => st.id === subTopicIdParam || slugify(st.id) === subTopicIdParam);
    const parentSubTopic = directMatch?.topics.some(t => t.id === topicIdParam || slugify(t.id) === topicIdParam)
      ? directMatch
      : course.subTopics.find(st => st.topics.some(t => t.id === topicIdParam || slugify(t.id) === topicIdParam));
    const topic = parentSubTopic?.topics.find(t => t.id === topicIdParam || slugify(t.id) === topicIdParam);
    if (parentSubTopic && topic && topic.id !== selectedTopicId) {
      setSelectedSubTopicId(parentSubTopic.id);
      setSelectedTopicId(topic.id);
    }
  }, [topicIdParam, subTopicIdParam, courseId]);

  const selectedCourse = selectedCourseId
    ? catalog.courses.find(c => c.id === selectedCourseId) || null
    : null;

  const selectedSubTopic = selectedCourse && selectedSubTopicId
    ? selectedCourse.subTopics.find(st => st.id === selectedSubTopicId) || null
    : null;

  const selectedTopic = selectedSubTopic && selectedTopicId
    ? selectedSubTopic.topics.find(t => t.id === selectedTopicId) || null
    : null;


  // Every topic previously shared one title and one description, so search results,
  // browser history and shared links were all indistinguishable.
  const pageMeta = useMemo(() => {
    if (selectedTopic && selectedCourse) {
      const blocks = [
        ...(selectedTopic.beginner || []),
        ...(selectedTopic.intermediate || []),
        ...(selectedTopic.expert || []),
      ];
      const description = toDescription(blocks[0]?.content || '')
        || `Learn ${selectedTopic.name} in the ${selectedCourse.name} course on JavaSchoolLab.`;
      return {
        title: `${selectedTopic.name} · ${selectedCourse.name}`,
        description,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'LearningResource',
          name: selectedTopic.name,
          description,
          learningResourceType: 'Lesson',
          inLanguage: 'en',
          isPartOf: {
            '@type': 'Course',
            name: selectedCourse.name,
          },
          provider: { '@type': 'Organization', name: 'DHIPAN Software Technologies Private Limited' },
        } as Record<string, unknown>,
      };
    }
    if (selectedCourse) {
      const topicCount = selectedCourse.subTopics.reduce((a, st) => a + st.topics.length, 0);
      return {
        title: selectedCourse.name,
        description: `${selectedCourse.name} on JavaSchoolLab: ${topicCount} topics across ${selectedCourse.subTopics.length} modules, with worked examples and interview questions.`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: selectedCourse.name,
          provider: { '@type': 'Organization', name: 'DHIPAN Software Technologies Private Limited' },
        } as Record<string, unknown>,
      };
    }
    return {
      title: '',
      description: 'Learn Java, Spring Boot, React and more with worked examples, diagrams and interview questions.',
      jsonLd: null,
    };
  }, [selectedTopic, selectedCourse]);

  useDocumentMeta({
    title: pageMeta.title,
    description: pageMeta.description,
    jsonLd: pageMeta.jsonLd,
  });

  const topicsList = selectedSubTopic ? selectedSubTopic.topics : [];
  const currentTopicIndex = topicsList.findIndex(t => t.id === selectedTopicId);
  const prevTopicName = currentTopicIndex > 0 ? topicsList[currentTopicIndex - 1].name : undefined;
  const nextTopicName = currentTopicIndex < topicsList.length - 1 ? topicsList[currentTopicIndex + 1].name : undefined;

  // Spoken ordinal words for list numbers ("1." -> "First,") so Robo Guru sounds like a
  // teacher walking through points, not a machine reading "one dot" literally.
  const ordinalWords = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
    'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth'];
  const numberToOrdinalWord = (n: number) => {
    if (n >= 1 && n <= 20) return ordinalWords[n];
    const lastTwo = n % 100;
    const last = n % 10;
    if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
    const suffix = last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
    return `${n}${suffix}`;
  };

  // Converts leading list numbers ("1. DDL Statements") into a spoken ordinal followed by a
  // comma for a natural pause ("First, DDL Statements") instead of the robotic "one dot".
  // Only fires right after a heading/line-break/list boundary (or block start), so version
  // numbers or decimals mid-sentence ("Java 8.") are left untouched.
  const humanizeListNumbers = (html: string) =>
    html.replace(/(<h[1-6][^>]*>|<br\s*\/?>|<li[^>]*>|<td[^>]*>|<strong[^>]*>|^)(\d{1,3})\.\s+/gim,
      (_match, lead, num) => `${lead}${numberToOrdinalWord(Number(num))}, `);

  // Picks the Indian-English voice that matches the chosen gender, else the best fallback.
  const pickVoice = (): SpeechSynthesisVoice | undefined => {
    const voices = window.speechSynthesis.getVoices();

    // Prefer a voice whose locale is explicitly Indian English (en-IN)
    const localeIndianVoices = voices.filter(v => v.lang?.toLowerCase() === 'en-in');
    const byName = (v: SpeechSynthesisVoice) => v.name.toLowerCase();

    // Known Indian English voice names shipped by Windows/Edge/Chrome/Google TTS
    const knownFemaleNames = ['heera', 'neerja', 'kalpana', 'lekha', 'veena', 'raveena', 'prataprao'];
    const knownMaleNames = ['raoji', 'prabhat', 'hemant', 'rishi', 'madhur', 'arjun'];

    const matchesGender = (v: SpeechSynthesisVoice) => {
      const vn = byName(v);
      if (knownFemaleNames.some(n => vn.includes(n))) return voiceGender === 'female';
      if (knownMaleNames.some(n => vn.includes(n))) return voiceGender === 'male';
      return voiceGender === 'female'
        ? vn.includes('female') || vn.includes('woman') || vn.includes('girl') || (!vn.includes('male'))
        : vn.includes('male') || vn.includes('man') || vn.includes('boy');
    };

    return (
      localeIndianVoices.find(matchesGender) ||
      localeIndianVoices[0] ||
      voices.find(v => {
        const vn = byName(v);
        const isIndian = vn.includes('indian') || vn.includes('hindi') || vn.includes('en-in');
        return isIndian && matchesGender(v);
      }) ||
      voices.find(matchesGender)
    );
  };

  // Stops the voice AND the pending pause timer, and invalidates the running script so a
  // late onend callback cannot start the next sentence.
  const stopSpeaking = () => {
    speechRunRef.current++;
    if (speechPauseRef.current) { clearTimeout(speechPauseRef.current); speechPauseRef.current = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Robo Guru speaks the topic one sentence at a time with natural pauses (see
  // lib/speechScript.ts), instead of one long utterance read in a single breath.
  const toggleSpeech = () => {
    if (isSpeaking) { stopSpeaking(); return; }
    if (!selectedTopic || !('speechSynthesis' in window)) return;

    // Levels were merged, so Robo Guru reads the entire topic in order.
    const contentBlocks = [
      ...(selectedTopic.beginner || []),
      ...(selectedTopic.intermediate || []),
      ...(selectedTopic.expert || []),
    ];
    const script = buildSpeechScript(selectedTopic.name, contentBlocks.map(b => humanizeListNumbers(b.content || '')));
    if (script.length <= 2) return;

    const run = ++speechRunRef.current;
    const voice = pickVoice();
    let index = 0;

    const speakNext = () => {
      if (run !== speechRunRef.current) return;           // stopped or replaced
      if (index >= script.length) { setIsSpeaking(false); return; }

      const seg = script[index];
      const { rate, pitch } = prosody(seg, index);
      index++;

      const utterance = new SpeechSynthesisUtterance(seg.text);
      utterance.lang = 'en-IN';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;
      if (voice) { utterance.voice = voice; utterance.lang = voice.lang || 'en-IN'; }

      const afterPause = () => {
        if (run !== speechRunRef.current) return;
        speechPauseRef.current = window.setTimeout(speakNext, seg.pause);
      };
      utterance.onend = afterPause;
      utterance.onerror = (e) => {
        // cancel() raises 'canceled'/'interrupted'; anything else, skip to the next sentence.
        if (e.error === 'canceled' || e.error === 'interrupted') return;
        afterPause();
      };
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    setIsSpeaking(true);
    speakNext();
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (isSpeaking) stopSpeaking();
  }, [selectedTopicId]);

  useEffect(() => { return () => { speechRunRef.current++; window.speechSynthesis.cancel(); }; }, []);

  // Global keyboard shortcuts (see lib/shortcuts.ts). The handler reads the latest
  // closures through a ref so the listener is attached once.
  const shortcutRef = useRef<(a: ShortcutAction) => void>(() => {});
  const pendingGRef = useRef<number | null>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modalOpen = !!document.querySelector('[aria-modal="true"]');
      const res = resolveShortcut(e, {
        pendingG: pendingGRef.current !== null,
        typing: isTypingTarget(e.target as HTMLElement),
        modalOpen,
      });
      if (pendingGRef.current !== null) { window.clearTimeout(pendingGRef.current); pendingGRef.current = null; }
      if (res.pendingG) pendingGRef.current = window.setTimeout(() => { pendingGRef.current = null; }, 1200);
      if (res.action === 'none') return;
      e.preventDefault();
      shortcutRef.current(res.action);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCourseSelect = (cId: string) => {
    setSelectedCourseId(cId);
    setSelectedSubTopicId(null);
    setSelectedTopicId(null);
    navigate(`/course/${slugify(cId)}`);
  };

  const handleModuleSelect = (cId: string, moduleId: string) => {
    setSelectedCourseId(cId);
    setSelectedSubTopicId(moduleId);
    setSelectedTopicId(null);
    navigate(`/course/${slugify(cId)}`);
  };

  const handleSubTopicSelect = (subTopicId: string) => {
    setSelectedSubTopicId(subTopicId);
    setSelectedTopicId(null);
  };

  // A drawer that stays open over the topic the reader just chose is worse than useless.
  useEffect(() => { setMobileDrawer(null); setMobileSearchOpen(false); }, [selectedTopicId]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    mobileSearchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchQuery(''); setMobileSearchOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileSearchOpen]);

  // Opening a drawer over an active search would leave the results pane behind it.
  useEffect(() => { if (mobileDrawer) setMobileSearchOpen(false); }, [mobileDrawer]);

  useEffect(() => {
    if (!mobileDrawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileDrawer(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileDrawer]);

  const handleTopicSelect = (topicId: string) => {
    let parentCourseId: string | null = null;
    let parentSubTopicId: string | null = null;
    for (const course of skeletonCourses) {
      for (const subTopic of course.subTopics) {
        if (subTopic.topics.some(topic => topic.id === topicId)) {
          parentCourseId = course.id;
          parentSubTopicId = subTopic.id;
          break;
        }
      }
      if (parentCourseId) break;
    }
    if (parentCourseId) setSelectedCourseId(parentCourseId);
    if (parentSubTopicId) setSelectedSubTopicId(parentSubTopicId);
    setSelectedTopicId(topicId);
    if (parentCourseId && parentSubTopicId) {
      // No ?level= any more: Basic and Expert were merged into a single view, so an old
      // bookmarked link carrying the parameter simply lands on the whole topic.
      navigate(`/course/${slugify(parentCourseId)}/${slugify(parentSubTopicId)}/${slugify(topicId)}`);
    }
    if (parentCourseId && parentSubTopicId) {
      markVisited(parentCourseId, parentSubTopicId, topicId);
      pushRecent(topicId);
    }
    setTimeout(() => {
      if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePrevTopic = () => {
    if (currentTopicIndex > 0) handleTopicSelect(topicsList[currentTopicIndex - 1].id);
  };
  const handleNextTopic = () => {
    if (currentTopicIndex < topicsList.length - 1) handleTopicSelect(topicsList[currentTopicIndex + 1].id);
  };

  const handleSearch = (query: string) => setSearchQuery(query);

  shortcutRef.current = (action) => {
    switch (action) {
      case 'palette': setHelpOpen(false); setPaletteOpen(o => !o); break;
      case 'help': setHelpOpen(true); break;
      case 'dashboard': navigate('/dashboard'); break;
      case 'theme': toggleTheme(); break;
      case 'prev': if (selectedTopic) handlePrevTopic(); break;
      case 'next': if (selectedTopic) handleNextTopic(); break;
      case 'sidebar':
        if (!selectedCourseId) break;
        if (isDesktop) setLeftSidebarMinimized(v => !v);
        else setMobileDrawer(d => (d === 'contents' ? null : 'contents'));
        break;
    }
  };

  const paletteActions: PaletteAction[] = [
    { id: 'dashboard', label: 'Dashboard', hint: 'Go to your dashboard', run: () => navigate('/dashboard') },
    { id: 'flashcards', label: 'Flashcards', hint: 'Practice with flashcards', run: () => navigate('/flashcards') },
    { id: 'interview', label: 'Mock interview', hint: 'Interview practice', run: () => navigate('/interview-practice') },
    { id: 'theme', label: 'Toggle theme', hint: 'Switch light / dark', run: () => toggleTheme() },
  ];

  // First visit to a course page: start the tour once the course has rendered.
  const courseReady = !!selectedCourseId && catalog.isLoaded(selectedCourseId);
  useEffect(() => {
    if (!courseReady || isTourDone()) return;
    const t = window.setTimeout(() => {
      if (!document.querySelector('[aria-modal="true"]')) setTourRun(true);
    }, 1500);
    return () => window.clearTimeout(t);
  }, [courseReady]);

  const filteredCourses = searchQuery
    ? skeletonCourses.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subTopics.some(subTopic =>
          subTopic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subTopic.topics.some(topic => topic.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      )
    : skeletonCourses;

  const showDashboard = !selectedCourseId;

  // Declared once so the desktop columns and the mobile drawers share one instance
  // of each pane rather than drifting apart.
  const sidebarEl = (
    <Sidebar
      courses={filteredCourses}
      selectedCourse={selectedCourseId}
      selectedSubTopic={selectedSubTopicId}
      selectedTopic={selectedTopicId}
      onCourseSelect={handleCourseSelect}
      onSubTopicSelect={handleSubTopicSelect}
      onTopicSelect={handleTopicSelect}
      searchQuery={searchQuery}
      isMinimized={isDesktop ? leftSidebarMinimized : false}
      onToggleMinimize={() => setLeftSidebarMinimized(!leftSidebarMinimized)}
      visitedTopics={visitedTopics}
    />
  );

  const rightSidebarEl = (
    <RightSidebar
      course={selectedCourse}
      topic={selectedTopic}
      topicName={selectedTopic?.name || null}
      isMinimized={isDesktop ? rightSidebarMinimized : false}
      onToggleMinimize={() => setRightSidebarMinimized(!rightSidebarMinimized)}
    />
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header
        onToggleSpeech={toggleSpeech}
        isSpeaking={isSpeaking}
        onSearch={handleSearch}
        showSearch={false}
        voiceGender={voiceGender}
        onVoiceChange={setVoiceGender}
        onOpenSearch={() => setPaletteOpen(true)}
      />

      {!showDashboard && (
        <TopicsBar courses={filteredCourses} onCourseSelect={handleCourseSelect} selectedCourseId={selectedCourseId} />
      )}

      {/* Below lg the sidebars are off-screen, so this bar is the only way to reach them. */}
      {!showDashboard && !isDesktop && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border-b border-orange-200/70 dark:border-orange-900/40">
          {mobileSearchOpen ? (
            // Takes the whole bar while active: a 44px-wide field on a phone is unusable,
            // and there is nothing else worth showing while someone is searching.
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-orange-300 dark:border-orange-900/60 bg-orange-50/60 dark:bg-orange-950/20">
                <Search className="w-4 h-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                {/* type=text, not search: the native search clear would render a second X
                    right beside the close button. inputMode keeps the search key on phones. */}
                <input
                  ref={mobileSearchRef}
                  type="text"
                  inputMode="search"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search every lesson…"
                  aria-label="Search topics and lesson content"
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => { setSearchQuery(""); setMobileSearchOpen(false); }}
                className="shrink-0 p-2 rounded-lg border border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-300"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMobileDrawer("contents")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50"
              >
                <PanelLeft className="w-4 h-4" aria-hidden="true" />
                Contents
              </button>
              <button
                type="button"
                aria-label="Search topics and lesson content"
                onClick={() => setMobileSearchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Search</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawer("notes")}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50"
              >
                Notes &amp; Q&amp;A
                <PanelRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {!showDashboard && isDesktop && !focusMode && sidebarEl}

        {/* The skip link targets this. min-w-0 stops a wide code block or table from
            forcing the whole flex row wider than the viewport. */}
        <main id="main-content" className="flex-1 flex min-w-0 overflow-hidden">
        {showDashboard ? (
          <Dashboard onCourseSelect={handleCourseSelect} />
        ) : searchQuery.trim().length >= 2 ? (
          // A real query searches every lesson body, not just titles. Picking a result
          // clears the query so the reader lands on the topic rather than back in results.
          catalog.allLoaded ? (
            <SearchResults
              courses={catalog.courses}
              query={searchQuery}
              onSelectTopic={(topicId) => { setSearchQuery(''); handleTopicSelect(topicId); }}
            />
          ) : (
            <LoadingPane label="Preparing search across all courses…" error={catalog.error} onRetry={catalog.retry} />
          )
        ) : selectedCourseId && !catalog.isLoaded(selectedCourseId) ? (
          <LoadingPane label="Loading course…" error={catalog.error} onRetry={catalog.retry} />
        ) : (
          <ContentArea
            course={selectedCourse}
            topic={selectedTopic}
            contentRef={contentRef}
            topRef={topRef}
            onTopicSelect={handleTopicSelect}
            onPrevTopic={handlePrevTopic}
            onNextTopic={handleNextTopic}
            hasPrev={currentTopicIndex > 0}
            hasNext={currentTopicIndex < topicsList.length - 1}
            prevTopicName={prevTopicName}
            nextTopicName={nextTopicName}
            isSpeaking={isSpeaking}
            onToggleSpeech={toggleSpeech}
            voiceGender={voiceGender}
            onVoiceChange={setVoiceGender}
            focusMode={focusMode}
            onToggleFocus={() => setFocusMode(f => !f)}
          />
        )}
        </main>

        {!showDashboard && isDesktop && !focusMode && rightSidebarEl}
      </div>

      {/* Mobile drawers. Rendered only when open so the panes do not run their
          animations and data work off-screen on every phone page load. */}
      {!showDashboard && !isDesktop && mobileDrawer && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileDrawer(null)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={mobileDrawer === "contents" ? "Course contents" : "Notes and interview questions"}
            // The panes use translucent gradients (…/90), which is fine as a column but lets page
            // text bleed through when they float over content. An opaque backing fixes that.
            className={`fixed top-0 bottom-0 z-50 w-[min(88vw,320px)] shadow-2xl bg-white dark:bg-gray-900 [&>aside]:h-full ${
              mobileDrawer === "contents" ? "left-0" : "right-0"
            }`}
          >
            <button
              type="button"
              onClick={() => setMobileDrawer(null)}
              aria-label="Close"
              className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-orange-200 dark:border-gray-700"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
            {mobileDrawer === "contents" ? sidebarEl : rightSidebarEl}
          </div>
        </>
      )}

      {/* Sits above the layout but below the mobile drawers (z-50), so opening the
          contents drawer never leaves an ad floating over it. */}
      <CornerAd />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        actions={paletteActions}
        onSelectCourse={handleCourseSelect}
        onSelectModule={handleModuleSelect}
        onSelectTopic={(id) => { setSearchQuery(''); handleTopicSelect(id); }}
      />
      <ShortcutsSheet
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onReplayTour={() => setTourRun(true)}
      />
      <OnboardingTour run={tourRun} onDone={() => setTourRun(false)} />
    </div>
  );
}
