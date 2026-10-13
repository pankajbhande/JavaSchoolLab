// The course workspace: header + course strip + sidebars + content area.
//
// This lives in its own module so it can be lazy-loaded. It statically imports
// coursesData, which pulls in every one of the 474 topics and their HTML bodies -
// several megabytes. Keeping that out of the entry chunk means /dashboard, where every
// visitor lands, no longer pays for content it does not render.

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
import { coursesData } from './data/coursesData';
import { slugify } from './lib/slug';
import { useProgress } from './context/ProgressContext';
import { useMediaQuery, DESKTOP_QUERY } from './hooks/useMediaQuery';
import { useFocusTrap } from './hooks/useFocusTrap';
import { useDocumentMeta, toDescription } from './hooks/useDocumentMeta';
import { PanelLeft, PanelRight, X, Search } from 'lucide-react';
import { courseStats } from './data/courseStats';

// courseStats.ts is generated (npm run gen:course-stats) and feeds the dashboard rings.
// The dashboard cannot import coursesData without undoing the code split, so this is the
// one place both are in scope - assert they agree rather than let the rings drift.
if (import.meta.env.DEV) {
  for (const course of coursesData) {
    const expected = course.subTopics.reduce((a, s) => a + s.topics.length, 0);
    const actual = courseStats[course.id];
    if (!actual) console.error('[courseStats] missing course:', course.id, '- run npm run gen:course-stats');
    else if (actual.topics !== expected) console.error('[courseStats] stale count for', course.id, actual.topics, '!=', expected, '- run npm run gen:course-stats');
  }
}

export default function CourseWorkspace() {
  const navigate = useNavigate();
  const { courseId, subTopicId: subTopicIdParam, topicId: topicIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {
    if (!courseId) return null;
    return coursesData.find(c => c.id === courseId || slugify(c.id) === courseId)?.id || null;
  });
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string | null>(() => {
    const course = coursesData.find(c => c.id === courseId || slugify(c.id) === courseId);
    if (!course || !topicIdParam) return null;
    const directMatch = course.subTopics.find(st => st.id === subTopicIdParam || slugify(st.id) === subTopicIdParam);
    const parentSubTopic = directMatch?.topics.some(t => t.id === topicIdParam || slugify(t.id) === topicIdParam)
      ? directMatch
      : course.subTopics.find(st => st.topics.some(t => t.id === topicIdParam || slugify(t.id) === topicIdParam));
    return parentSubTopic?.id || null;
  });
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(() => {
    const course = coursesData.find(c => c.id === courseId || slugify(c.id) === courseId);
    if (!course || !topicIdParam) return null;
    for (const st of course.subTopics) {
      const topic = st.topics.find(t => t.id === topicIdParam || slugify(t.id) === topicIdParam);
      if (topic) return topic.id;
    }
    return null;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const contentRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync URL param to state — matched via slugify() since the URL segment may be a slug
  // (spaces -> underscores) rather than the real id.
  useEffect(() => {
    if (!courseId) {
      setSelectedCourseId(null);
      return;
    }
    const course = coursesData.find(c => c.id === courseId || slugify(c.id) === courseId);
    if (course && course.id !== selectedCourseId) setSelectedCourseId(course.id);
  }, [courseId]);

  // Sync the /course/:courseId/:subTopicId/:topicId URL params to state — handles a direct
  // visit/refresh on a deep topic URL, and browser back/forward navigation between topics.
  useEffect(() => {
    if (!topicIdParam) return;
    const course = coursesData.find(c => c.id === courseId || slugify(c.id) === courseId);
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
    ? coursesData.find(c => c.id === selectedCourseId) || null
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

  // Strips HTML tags/entities so speech reads plain, natural sentences instead of markup
  const stripHtml = (html: string) =>
    humanizeListNumbers(html)
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6]|tr|br)>/gi, '. ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, 'and')
      .replace(/&lt;/g, '')
      .replace(/&gt;/g, '')
      .replace(/&quot;/g, '"')
      .replace(/•/g, '. ')
      .replace(/\s+/g, ' ')
      .replace(/\.\s*\./g, '.')
      .trim();

  // Text-to-speech — reads from the topic's actual content data (explanatory text only),
  // never the raw DOM: skips UI labels like "9 min read" and skips code blocks entirely,
  // since reading Java syntax (braces/semicolons) aloud sounds robotic, not human.
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!selectedTopic) return;

    // Levels were merged, so Robo Guru reads the entire topic in order.
    const contentBlocks = [
      ...(selectedTopic.beginner || []),
      ...(selectedTopic.intermediate || []),
      ...(selectedTopic.expert || []),
    ];

    const spokenText = [
      selectedTopic.name + '.',
      ...contentBlocks.map(block => stripHtml(block.content || '')),
    ].filter(Boolean).join(' ');

    if (!spokenText.trim()) return;

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = 'en-IN';
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        utterance.volume = 1;
        const voices = window.speechSynthesis.getVoices();

        // Prefer a voice whose locale is explicitly Indian English (en-IN)
        const localeIndianVoices = voices.filter(v => v.lang?.toLowerCase() === 'en-in');
        const byName = (v: SpeechSynthesisVoice) => v.name.toLowerCase();

        // Known Indian English voice names shipped by Windows/Edge/Chrome/Google TTS
        const knownFemaleNames = ['heera', 'neerja', 'kalpana', 'lekha', 'veena', 'raveena', 'priya'];
        const knownMaleNames = ['ravi', 'prabhat', 'hemant', 'rishi', 'madhur', 'arjun'];

        const matchesGender = (v: SpeechSynthesisVoice) => {
          const vn = byName(v);
          if (knownFemaleNames.some(n => vn.includes(n))) return voiceGender === 'female';
          if (knownMaleNames.some(n => vn.includes(n))) return voiceGender === 'male';
          return voiceGender === 'female'
            ? vn.includes('female') || vn.includes('woman') || vn.includes('girl') || (!vn.includes('male'))
            : vn.includes('male') || vn.includes('man') || vn.includes('boy');
        };

        const indianVoice =
          localeIndianVoices.find(matchesGender) ||
          localeIndianVoices[0] ||
          voices.find(v => {
            const vn = byName(v);
            const isIndian = vn.includes('indian') || vn.includes('hindi') || vn.includes('en-in');
            return isIndian && matchesGender(v);
          });

        if (indianVoice) {
          utterance.voice = indianVoice;
          utterance.lang = indianVoice.lang || 'en-IN';
        } else {
          const genderVoice = voices.find(matchesGender);
          if (genderVoice) utterance.voice = genderVoice;
        }
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
  }, [selectedTopicId]);

  useEffect(() => { return () => { window.speechSynthesis.cancel(); }; }, []);

  // Keyboard shortcut: "/" focuses the search box (unless already typing somewhere)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isTyping) return;
      e.preventDefault();
      document.getElementById('global-search-input')?.focus();
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
    for (const course of coursesData) {
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

  const filteredCourses = searchQuery
    ? coursesData.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subTopics.some(subTopic =>
          subTopic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subTopic.topics.some(topic => topic.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      )
    : coursesData;

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
        {!showDashboard && isDesktop && sidebarEl}

        {/* The skip link targets this. min-w-0 stops a wide code block or table from
            forcing the whole flex row wider than the viewport. */}
        <main id="main-content" className="flex-1 flex min-w-0 overflow-hidden">
        {showDashboard ? (
          <Dashboard onCourseSelect={handleCourseSelect} />
        ) : searchQuery.trim().length >= 2 ? (
          // A real query searches every lesson body, not just titles. Picking a result
          // clears the query so the reader lands on the topic rather than back in results.
          <SearchResults
            courses={coursesData}
            query={searchQuery}
            onSelectTopic={(topicId) => { setSearchQuery(''); handleTopicSelect(topicId); }}
          />
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
          />
        )}
        </main>

        {!showDashboard && isDesktop && rightSidebarEl}
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
    </div>
  );
}
