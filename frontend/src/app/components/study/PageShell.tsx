import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import logo from '../../../assets/logo1.jpg';
import { useTheme } from '../ThemeProvider';

interface Props {
  title: string;
  subtitle?: string;
  /** Optional controls shown on the right of the top bar. */
  actions?: React.ReactNode;
  /** Narrow reading width (default) or wider layout. */
  wide?: boolean;
  children: React.ReactNode;
}

/** Branded chrome shared by the flashcards, interview practice and 404 pages. */
export function PageShell({ title, subtitle, actions, wide, children }: Props) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <a
        href="#study-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-orange-700"
      >
        Skip to content
      </a>
      <header className="bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            to="/dashboard"
            className="flex shrink-0 items-center gap-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="JavaSchoolLab home"
          >
            <img src={logo} alt="" className="h-9 w-9 rounded-xl bg-white/90 object-contain p-0.5 shadow ring-1 ring-white/40" />
            <span className="hidden text-sm font-bold tracking-tight sm:inline">JavaSchoolLab</span>
          </Link>
          <span aria-hidden className="hidden h-6 w-px bg-white/40 sm:block" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold leading-tight sm:text-lg">{title}</h1>
            {subtitle && <p className="truncate text-xs text-white/85">{subtitle}</p>}
          </div>
          {actions}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>
      <main id="study-main" className={`mx-auto w-full flex-1 px-4 py-6 sm:py-8 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {children}
      </main>
    </div>
  );
}

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';
export const card =
  'rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800';
