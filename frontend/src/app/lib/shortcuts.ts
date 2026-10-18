// Pure keyboard-shortcut matching, kept free of the DOM so it can be unit tested.

export type ShortcutAction =
  | 'palette' | 'help' | 'dashboard' | 'prev' | 'next' | 'theme' | 'sidebar' | 'none';

export interface KeyLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export interface ShortcutResult { action: ShortcutAction; pendingG: boolean; }

export interface ShortcutDef { keys: string[]; label: string; }

export const SHORTCUT_LIST: ShortcutDef[] = [
  { keys: ['Ctrl', 'K'], label: 'Open search (Cmd K on Mac)' },
  { keys: ['/'], label: 'Open search' },
  { keys: ['?'], label: 'Show this help' },
  { keys: ['g', 'd'], label: 'Go to dashboard' },
  { keys: ['[', ']'], label: 'Previous / next topic' },
  { keys: ['Alt', '← →'], label: 'Previous / next topic' },
  { keys: ['t'], label: 'Toggle light / dark theme' },
  { keys: ['b'], label: 'Toggle the contents sidebar' },
  { keys: ['Esc'], label: 'Close dialogs, leave focus mode' },
];

/** True for elements where typing letters must not trigger shortcuts. */
export function isTypingTarget(t: { tagName?: string; isContentEditable?: boolean } | null | undefined): boolean {
  if (!t) return false;
  const tag = (t.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!t.isContentEditable;
}

/**
 * Decide what a key press means. `typing` / `modalOpen` suppress everything except
 * Ctrl/Cmd+K, which must work from inside inputs (and closes the palette again).
 */
export function resolveShortcut(
  e: KeyLike,
  state: { pendingG: boolean; typing: boolean; modalOpen: boolean },
): ShortcutResult {
  const none: ShortcutResult = { action: 'none', pendingG: false };
  const mod = !!(e.ctrlKey || e.metaKey);
  const key = e.key;

  if (mod && !e.altKey && key.toLowerCase() === 'k') return { action: 'palette', pendingG: false };
  if (state.typing || state.modalOpen) return none;

  if (e.altKey && !mod && !e.shiftKey) {
    if (key === 'ArrowLeft') return { action: 'prev', pendingG: false };
    if (key === 'ArrowRight') return { action: 'next', pendingG: false };
    return none;
  }
  if (mod || e.altKey) return none;

  if (state.pendingG && key === 'd') return { action: 'dashboard', pendingG: false };
  if (key === 'g') return { action: 'none', pendingG: true };
  switch (key) {
    case '/': return { action: 'palette', pendingG: false };
    case '?': return { action: 'help', pendingG: false };
    case '[': return { action: 'prev', pendingG: false };
    case ']': return { action: 'next', pendingG: false };
    case 't': return { action: 'theme', pendingG: false };
    case 'b': return { action: 'sidebar', pendingG: false };
    default: return none;
  }
}
