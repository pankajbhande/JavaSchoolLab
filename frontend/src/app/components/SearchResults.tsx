import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, FileText } from 'lucide-react';
import type { Course } from '../data/types';
import { ensureIndex, searchContent, SearchHit } from '../services/contentSearch';
import { searchServer } from '../services/searchApi';

interface SearchResultsProps {
  courses: Course[];
  query: string;
  onSelectTopic: (topicId: string) => void;
}

/** Wraps each occurrence of any query word in a mark, case-insensitively. */
function Highlighted({ text, term }: { text: string; term: string }) {
  const { parts, re } = useMemo(() => {
    const words = Array.from(new Set(term.trim().toLowerCase().split(/\s+/).filter(w => w.length >= 2)));
    if (words.length === 0) return { parts: [text], re: null as RegExp | null };
    const escaped = words.sort((x, y) => y.length - x.length).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const rx = new RegExp(`(${escaped.join('|')})`, 'gi');
    return { parts: text.split(rx), re: new RegExp(`^(?:${escaped.join('|')})$`, 'i') };
  }, [text, term]);

  return (
    <>
      {parts.map((part, i) =>
        re && re.test(part)
          ? <mark key={i} className="bg-orange-200 dark:bg-orange-500/40 text-gray-900 dark:text-orange-50 font-medium rounded-sm px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

export function SearchResults({ courses, query, onSelectTopic }: SearchResultsProps) {
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [indexing, setIndexing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    setIndexing(true);
    // Prefer the server (OpenSearch): no course download, ranked results. If it is off or not ready, search in the page as before.
    searchServer(query, ctrl.signal).then(serverHits => {
      if (cancelled) return;
      if (serverHits) { setIndexing(false); setHits(serverHits); return; }
      return ensureIndex(courses).then(entries => {
        if (cancelled) return;
        setIndexing(false);
        setHits(searchContent(entries, query));
      });
    }).catch(() => {});
    return () => { cancelled = true; ctrl.abort(); };
  }, [courses, query]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h2 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            Results for “{query}”
          </h2>
        </div>
        <p role="status" aria-live="polite" className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {indexing && hits === null
            ? 'Preparing search across every topic…'
            : `${hits?.length ?? 0} ${hits?.length === 1 ? 'topic' : 'topics'} matched, searching titles and full lesson text`}
        </p>

        {indexing && hits === null && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" />
            <span className="text-sm">Indexing lesson content, one moment…</span>
          </div>
        )}

        {hits !== null && hits.length === 0 && !indexing && (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Nothing matched that</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Try a shorter phrase, or a single keyword such as a class or method name.
            </p>
          </div>
        )}

        <div className="space-y-3" role="list">
          {hits?.map(hit => (
            <motion.button
              key={hit.courseId + '/' + hit.topicId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelectTopic(hit.topicId)}
              className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              <div className="text-[11px] uppercase tracking-wider text-orange-700 dark:text-orange-300 font-semibold mb-1">
                {hit.courseName} <span aria-hidden="true">›</span> {hit.moduleName}
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                <Highlighted text={hit.topicName} term={query} />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                <Highlighted text={hit.snippet} term={query} />
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
