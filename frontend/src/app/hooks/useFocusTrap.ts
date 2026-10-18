import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Keeps keyboard focus inside an open dialog and restores it on close.
 *
 * Declaring aria-modal="true" tells assistive tech that everything outside the dialog is
 * inert, so Tab really must not walk out of it — otherwise a keyboard user silently ends
 * up interacting with content the screen reader has already hidden.
 *
 * Returns a ref to attach to the dialog container.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Move focus in, so the first Tab continues from inside rather than from the page top.
    const first = node.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node).focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(el => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) { e.preventDefault(); return; }

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      // Wrap around at both ends rather than letting focus leave the dialog.
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      // Send focus back where it came from, so the trigger button is still the cursor.
      previouslyFocused.current?.focus?.({ preventScroll: true });
    };
  }, [active]);

  return ref;
}
