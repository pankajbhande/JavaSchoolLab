import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ADSENSE_CLIENT, adsEnabled, loadAdSense } from './adsense';
import { useConsent } from '../../lib/consent';

interface AdSlotProps {
  /** Numeric ad unit id from the AdSense dashboard. */
  slot: string;
  /** Reserved box. Held before the ad arrives so the layout never jumps (CLS). */
  width: number;
  height: number;
  format?: 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
  /** AdSense requires paid units be distinguishable from editorial content. */
  label?: boolean;
}

type Status = 'idle' | 'requested' | 'filled' | 'empty';

/**
 * One AdSense display unit, built for a single-page app.
 *
 * Three things this handles that a pasted AdSense snippet does not:
 *
 * 1. **Refill on navigation.** A route change is not a page load, so the pasted snippet
 *    renders once and then shows the same ad for the rest of the session. Students here
 *    move between topics constantly without ever reloading, so the `<ins>` is rebuilt and
 *    re-pushed on every path change. This is the single biggest lever on revenue.
 * 2. **The element is built imperatively.** AdSense mutates the `<ins>` it is given;
 *    React reconciling that same node fights it and produces blank units. Creating it
 *    outside React's tree sidesteps the conflict entirely.
 * 3. **No empty boxes.** Blocked, unconfigured or unfilled units collapse to nothing
 *    rather than leaving a labelled hole in the sidebar.
 */
export function AdSlot({ slot, width, height, format = 'rectangle', className = '', label = true }: AdSlotProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const { pathname } = useLocation();
  const consent = useConsent();

  // Only request an ad once the slot is near the viewport. An impression that is never
  // seen drags the unit's viewability down, and viewability is what sets the CPM
  // advertisers are willing to pay — so this raises earnings rather than lowering them.
  useEffect(() => {
    if (!adsEnabled || !slot || consent !== 'granted') return;
    const host = hostRef.current;
    if (!host) return;

    setStatus('idle');

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        setStatus('requested');
      },
      { rootMargin: '400px' },
    );
    observer.observe(host);
    return () => observer.disconnect();
    // pathname is a dependency on purpose: a topic change must re-arm the whole cycle.
  }, [slot, pathname, consent]);

  useEffect(() => {
    if (status !== 'requested') return;
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let fillCheck: number | undefined;

    loadAdSense()
      .then(() => {
        if (cancelled || !hostRef.current) return;

        // Wipe whatever the previous route left behind before asking for a new one.
        host.replaceChildren();

        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'inline-block';
        ins.style.width = width + 'px';
        ins.style.height = height + 'px';
        ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
        ins.setAttribute('data-ad-slot', slot);
        ins.setAttribute('data-ad-format', format);
        // Fixed-size units in a fixed-width rail: letting AdSense stretch them would
        // overflow the 304 px sidebar.
        ins.setAttribute('data-full-width-responsive', 'false');
        host.appendChild(ins);

        (window.adsbygoogle = window.adsbygoogle || []).push({});

        // AdSense stamps data-ad-status once it has decided. No fill is routine — house
        // ads and unsold inventory both land here — and an empty bordered box looks
        // broken, so the slot collapses instead.
        fillCheck = window.setTimeout(() => {
          if (cancelled) return;
          setStatus(ins.getAttribute('data-ad-status') === 'unfilled' ? 'empty' : 'filled');
        }, 2500);
      })
      .catch(() => {
        if (!cancelled) setStatus('empty');
      });

    return () => {
      cancelled = true;
      if (fillCheck) window.clearTimeout(fillCheck);
    };
  }, [status, slot, width, height, format]);

  if (!adsEnabled || !slot || consent !== 'granted' || status === 'empty') return null;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 select-none">
          Advertisement
        </span>
      )}
      <div
        ref={hostRef}
        // The box is reserved up front so the sidebar does not shift when the ad lands.
        style={{ width, height }}
        className="overflow-hidden rounded-lg bg-gray-100/60 dark:bg-gray-800/40"
      />
    </div>
  );
}
