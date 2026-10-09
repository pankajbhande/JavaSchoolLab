import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, FileText } from 'lucide-react';
import type { Course } from '../data/types';
import { ensureIndex, searchContent, SearchHit } from '../services/contentSearch';

interface SearchResultsProps {
  courses: Course[];
  query: string;
  onSelectTopic: (topicId: string) => void;
}

/** Wraps each occurrence of `term` in a mark, case-insensitively. */
function Highlighted({ text, term }: { text: string; term: string }) {
  const parts = useMemo(() => {
    const q = term.trim();
    if (!q) return [text];
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, (m) => '\\' + m);
    return text.split(new RegExp(`(${escaped})`, 'gi'));
  }, [text, term]);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.trim().toLowerCase()
          ? <mark key={i} className="bg-orange-300 dark:bg-orange-600 text-inherit rounded-sm px-0.5">{part}</mark>
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
    setIndexing(true);
    ensureIndex(courses).then(entries => {
      if (cancelled) return;
      setIndexing(false);
      setHits(searchContent(entries, query));
    });
    return () => { cancelled = true; };
  }, [courses, query]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h2 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            Results for “{query}”
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {indexing && hits === null
            ? 'Preparing search across every topic…'
            : `${hits?.length ?? 0} ${hits?.length === 1 ? 'topic' : 'topics'} matched, searching titles and full lesson text`}
        </p>

        {indexing && hits === null && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Indexing lesson content, one moment…</span>
          </div>
        )}

        {hits !== null && hits.length === 0 && !indexing && (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Nothing matched that</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Try a shorter phrase, or a single keyword such as a class or method name.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {hits?.map(hit => (
            <motion.button
              key={hit.courseId + '/' + hit.topicId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelectTopic(hit.topicId)}
              className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-orange-400 dark:hover:border-orange-600 transition-colors"
            >
              <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                {hit.courseName} · {hit.moduleName}
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                <Highlighted text={hit.topicName} term={query} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                <Highlighted text={hit.snippet} term={query} />
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
