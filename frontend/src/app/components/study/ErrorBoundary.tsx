import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Changing this value (e.g. the pathname) clears a caught error so navigation recovers. */
  resetKey?: string;
}
interface State { error: Error | null }

/**
 * Catches render errors anywhere below it so a crash shows a friendly screen instead of a blank
 * page. It sits outside the router-aware shell, so it uses plain links and no context.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-2xl text-orange-600 dark:bg-orange-900/40" aria-hidden>!</div>
          <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            The page hit an unexpected problem. Your progress is saved. Reloading usually fixes it.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              Reload page
            </button>
            <a
              href="/dashboard"
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Go home
            </a>
          </div>
          <details className="mt-5 text-left text-xs text-gray-600 dark:text-gray-300">
            <summary className="cursor-pointer font-medium">Technical details</summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-100 p-3 dark:bg-gray-900">{error.message || String(error)}</pre>
          </details>
        </div>
      </div>
    );
  }
}
