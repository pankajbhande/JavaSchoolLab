import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AdSlot } from './AdSlot';
import { AD_SLOTS, adsEnabled } from './adsense';
import { useConsent } from '../../lib/consent';
import { usePro } from '../../context/ProContext';

const DISMISS_KEY = 'jsl_corner_ad_dismissed';

/**
 * Dismissible corner unit, bottom-right on desktop and bottom-centre on mobile.
 *
 * Deliberately restrained, because the audience is developers and the content is the
 * product: it waits until the student is actually reading, it never covers the content
 * column on desktop, it closes on one click, and it stays closed for the rest of the
 * session. Nothing here interrupts, redirects or takes over the page.
 */
function CornerAdUnit() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const consent = useConsent();

  useEffect(() => {
    if (!adsEnabled || !AD_SLOTS.corner || consent !== 'granted') return;

    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
        return;
      }
    } catch {
      // Private mode or blocked storage. Showing the unit is the right fallback.
    }

    // Held back so it is not competing with the first paint of the topic the student
    // came to read. A unit shown at second 20 to an engaged reader is worth more than
    // one shown at second 0 to someone still deciding whether to stay.
    const timer = window.setTimeout(() => setVisible(true), 20_000);
    return () => window.clearTimeout(timer);
  }, [consent]);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Not worth surfacing: it just means the unit can return on the next route.
    }
  };

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed z-40 bottom-3 right-3 max-sm:right-1/2 max-sm:translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-500"
      role="complementary"
      aria-label="Advertisement"
    >
      <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur p-1.5 shadow-xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close advertisement"
          className="absolute -top-2 -right-2 z-10 p-1 rounded-full bg-gray-700 text-white shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>

        {/* 300x250 on desktop, 320x100 on phones: a 250 px-tall box on a small screen
            eats the reading area, and Google penalises exactly that. */}
        <div className="hidden sm:block">
          <AdSlot slot={AD_SLOTS.corner} width={300} height={250} format="rectangle" />
        </div>
        <div className="sm:hidden">
          <AdSlot slot={AD_SLOTS.corner} width={320} height={100} format="horizontal" />
        </div>
      </div>
    </div>
  );
}

/** Pro learners never see the corner unit. */
export function CornerAd() {
  const { isPro } = usePro();
  return isPro ? null : <CornerAdUnit />;
}
