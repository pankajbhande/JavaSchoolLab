import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { PageShell, btnPrimary, btnSecondary, card as cardCls } from '../components/study/PageShell';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { courseIndex } from '../data/courseIndex';
import { slugify } from '../lib/slug';

const POPULAR = ['java', 'spring-boot', 'react-js', 'mysql', 'microservices-fundamentals', 'algorithms', 'python', 'javascript'];

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  useDocumentMeta({ title: 'Page not found', description: 'This page does not exist on JavaSchoolLab.', path: pathname });

  const popular = POPULAR.map(id => courseIndex.find(c => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c);
  const term = q.trim().toLowerCase();
  const matches = term ? courseIndex.filter(c => c.name.toLowerCase().includes(term)).slice(0, 6) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matches.length === 1) navigate(`/course/${slugify(matches[0].id)}`);
    else navigate('/dashboard');
  };

  return (
    <PageShell title="Page not found">
      <div className="text-center">
        <p className="text-7xl font-extrabold text-orange-600 dark:text-orange-400" aria-hidden>404</p>
        <h2 className="mt-2 text-2xl font-bold">We could not find that page</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Nothing lives at <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">{pathname}</code>. It may have moved, or the link is mistyped.
        </p>
      </div>

      <form onSubmit={submit} role="search" className="mx-auto mt-6 max-w-lg">
        <label htmlFor="nf-search" className="sr-only">Search courses</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            id="nf-search" type="search" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search for a course..."
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-gray-600 dark:bg-gray-800"
          />
          <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700">
            Search
          </button>
        </div>
        {matches.length > 0 && (
          <ul className={`${cardCls} mt-2 divide-y divide-gray-200 text-left dark:divide-gray-700`}>
            {matches.map(c => (
              <li key={c.id}>
                <Link to={`/course/${slugify(c.id)}`} className="block px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-gray-700">{c.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" className={btnSecondary} onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Go back
        </button>
        <Link to="/dashboard" className={btnPrimary}>Go to dashboard</Link>
      </div>

      <section className="mt-10" aria-labelledby="pop-h">
        <h3 id="pop-h" className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Popular courses</h3>
        <ul className="flex flex-wrap justify-center gap-2">
          {popular.map(c => (
            <li key={c.id}>
              <Link to={`/course/${slugify(c.id)}`} className="inline-block rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-800 hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-orange-900 dark:bg-gray-800 dark:text-orange-200 dark:hover:bg-gray-700">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
