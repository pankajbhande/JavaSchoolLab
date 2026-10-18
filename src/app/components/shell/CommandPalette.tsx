import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Zap, BookOpen, Layers, FileText, Clock, CornerDownLeft, X } from 'lucide-react';
import { courseIndex } from '../../data/courseIndex';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { flattenIndex, searchNames, queryTerms, highlightParts, type NameEntry } from '../../lib/searchRank';
import { getRecents } from '../../lib/recentTopics';
import { loadAllCourses } from '../../data/courseLoader';
import { ensureIndex, searchContent, type SearchHit } from '../../services/contentSearch';

const ENTRIES: NameEntry[] = flattenIndex(courseIndex);
const TOPIC_BY_ID = new Map<string, NameEntry>();
for (const e of ENTRIES) if (e.kind === 'topic' && !TOPIC_BY_ID.has(e.id)) TOPIC_BY_ID.set(e.id, e);

export interface PaletteAction { id: string; label: string; hint?: string; run: () => void; }

interface Item {
  key: string;
  kind: 'course' | 'module' | 'topic' | 'action';
  run?: () => void;
  hint?: string;
  name: string;
  courseId: string;
  moduleId?: string;
  topicId?: string;
  crumb?: string;
  snippet?: string;
  section: string;
  recent?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectCourse: (courseId: string) => void;
  onSelectModule: (courseId: string, moduleId: string) => void;
  onSelectTopic: (topicId: string) => void;
  /** Quick actions (Dashboard, Flashcards, ...). */
  actions?: PaletteAction[];
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlightParts(text, terms).map((p, i) =>
        p.match
          ? <mark key={i} className="rounded-sm bg-orange-200 px-0.5 text-inherit dark:bg-orange-500/40">{p.text}</mark>
          : <span key={i}>{p.text}</span>)}
    </>
  );
}

const ICON = { course: BookOpen, module: Layers, topic: FileText, action: Zap } as const;

function PaletteInner({ onClose, onSelectCourse, onSelectModule, onSelectTopic, actions = [] }: Omit<Props, 'open'>) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [active, setActive] = useState(0);
  const [content, setContent] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(true);
  const listRef = useRef<HTMLDivElement>(null);
  const [recents] = useState(getRecents);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) { setContent([]); setSearching(false); return; }
    let cancelled = false;
    setSearching(true);
    loadAllCourses()
      .then(ensureIndex)
      .then(entries => { if (!cancelled) { setContent(searchContent(entries, debounced, 12)); setSearching(false); } })
      .catch(() => { if (!cancelled) { setContent([]); setSearching(false); } });
    return () => { cancelled = true; };
  }, [debounced]);

  const terms = useMemo(() => queryTerms(query), [query]);

  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    const q = query.trim();
    const actionItems = (list: PaletteAction[]): Item[] => list.map(a => ({
      key: 'a:' + a.id, kind: 'action', name: a.label, courseId: '', run: a.run, hint: a.hint, section: 'Quick actions',
    }));
    if (!q) {
      for (const id of recents) {
        const e = TOPIC_BY_ID.get(id);
        if (e) out.push({ key: 'r:' + id, kind: 'topic', name: e.name, courseId: e.courseId, moduleId: e.moduleId, topicId: id, crumb: `${e.courseName} › ${e.moduleName}`, section: 'Recent topics', recent: true });
      }
      out.push(...actionItems(actions));
      for (const e of ENTRIES) if (e.kind === 'course') out.push({ key: 'c:' + e.id, kind: 'course', name: e.name, courseId: e.id, section: 'Courses' });
      return out;
    }
    const qt = queryTerms(q);
    out.push(...actionItems(actions.filter(a => qt.every(t => a.label.toLowerCase().includes(t)))));
    const names = searchNames(ENTRIES, q);
    const label = { course: 'Courses', module: 'Modules', topic: 'Topics' } as const;
    for (const kind of ['course', 'module', 'topic'] as const) {
      for (const h of names.filter(n => n.kind === kind)) {
        out.push({
          key: `${kind}:${h.courseId}:${h.id}`, kind, name: h.name, courseId: h.courseId, moduleId: h.moduleId,
          topicId: kind === 'topic' ? h.id : undefined,
          crumb: kind === 'course' ? undefined : kind === 'module' ? h.courseName : `${h.courseName} › ${h.moduleName}`,
          section: label[kind],
        });
      }
    }
    const seen = new Set(out.filter(i => i.topicId).map(i => i.topicId));
    for (const h of content) {
      if (seen.has(h.topicId)) continue;
      out.push({ key: `l:${h.courseId}:${h.topicId}`, kind: 'topic', name: h.topicName, courseId: h.courseId, moduleId: h.moduleId, topicId: h.topicId, crumb: `${h.courseName} › ${h.moduleName}`, snippet: h.snippet, section: 'In lessons' });
    }
    return out;
  }, [query, recents, content, actions]);

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, items.length]);

  const choose = (it: Item | undefined) => {
    if (!it) return;
    onClose();
    if (it.kind === 'action') it.run?.();
    else if (it.kind === 'course') onSelectCourse(it.courseId);
    else if (it.kind === 'module' && it.moduleId) onSelectModule(it.courseId, it.moduleId);
    else if (it.topicId) onSelectTopic(it.topicId);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (items.length ? (a + 1) % items.length : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (items.length ? (a - 1 + items.length) % items.length : 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(items[active]); }
  };

  let lastSection = '';
  const showEmpty = query.trim() && items.length === 0 && !searching;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search courses and lessons"
        className="relative flex max-h-[78vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="flex items-center gap-2 border-b border-gray-200 px-3 dark:border-gray-700">
          <Search className="h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden="true" />
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={items[active] ? `cmdk-opt-${active}` : undefined}
            aria-label="Search courses, modules, topics and lessons"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search courses, topics, lessons…"
            className="h-14 min-w-0 flex-1 border-none bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-gray-400 dark:hover:bg-gray-800">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div ref={listRef} id="cmdk-list" role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 custom-scrollbar">
          {items.map((it, i) => {
            const header = it.section !== lastSection ? (lastSection = it.section) : null;
            const Icon = it.recent ? Clock : ICON[it.kind];
            return (
              <div key={it.key} role="presentation">
                {header && <div role="presentation" className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 first:pt-1 dark:text-gray-400">{header}</div>}
                <div
                  id={`cmdk-opt-${i}`}
                  data-idx={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => i !== active && setActive(i)}
                  onClick={() => choose(it)}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2 ${i === active ? 'bg-orange-100 dark:bg-orange-500/20' : ''}`}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"><Highlight text={it.name} terms={terms} /></div>
                    {it.hint && <div className="truncate text-xs text-gray-500 dark:text-gray-400">{it.hint}</div>}
                    {it.crumb && <div className="truncate text-xs text-gray-500 dark:text-gray-400">{it.crumb}</div>}
                    {it.snippet && <div className="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-gray-300"><Highlight text={it.snippet} terms={terms} /></div>}
                  </div>
                  {i === active && <CornerDownLeft className="mt-1 hidden h-3.5 w-3.5 shrink-0 text-gray-400 sm:block" aria-hidden="true" />}
                </div>
              </div>
            );
          })}
          {searching && (
            <div role="status" className="flex items-center gap-2 px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-orange-200 border-t-orange-500 motion-safe:animate-spin" aria-hidden="true" />
              Searching lessons...
            </div>
          )}
          {showEmpty && <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No results for “{query.trim()}”</div>}
        </div>

        <div className="hidden items-center gap-4 border-t border-gray-200 px-3 py-2 text-[11px] text-gray-500 dark:border-gray-700 dark:text-gray-400 sm:flex">
          <span><kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> navigate</span>
          <span><kbd className="kbd">Enter</kbd> open</span>
          <span><kbd className="kbd">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

export function CommandPalette(props: Props) {
  if (!props.open) return null;
  const { open: _o, ...rest } = props;
  return <PaletteInner {...rest} />;
}
