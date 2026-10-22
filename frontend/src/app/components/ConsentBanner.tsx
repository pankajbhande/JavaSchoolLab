import { Link } from 'react-router-dom';
import { adsEnabled } from './ads/adsense';
import { setConsent, useConsent } from '../lib/consent';

/**
 * Asks once whether ads (cookies from Google and its partners) may be shown. Only appears when ads are configured for this build and the visitor
 * has not chosen yet; "No thanks" means no advertising script is ever loaded. The choice can be changed on the Privacy Policy page.
 */
export function ConsentBanner() {
  const consent = useConsent();
  if (!adsEnabled || consent !== null) return null;
  return (
    <div role="dialog" aria-live="polite" aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-gray-300 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur p-3 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
          JavaSchoolLab is free and supported by ads. Ads are provided by Google and its partners, who use cookies. Allow them? Learning works the same either way.
          See the <Link to="/privacy" className="underline text-orange-700 dark:text-orange-300">Privacy Policy</Link>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => setConsent('denied')}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
            No thanks
          </button>
          <button type="button" onClick={() => setConsent('granted')}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
            Allow ads
          </button>
        </div>
      </div>
    </div>
  );
}
