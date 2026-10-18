import { describe, it, expect } from 'vitest';
import { resolveShortcut, isTypingTarget } from './shortcuts';

const idle = { pendingG: false, typing: false, modalOpen: false };

describe('resolveShortcut', () => {
  it('opens the palette with Ctrl+K and Cmd+K, even while typing', () => {
    expect(resolveShortcut({ key: 'k', ctrlKey: true }, idle).action).toBe('palette');
    expect(resolveShortcut({ key: 'K', metaKey: true }, { ...idle, typing: true }).action).toBe('palette');
  });

  it('maps plain keys', () => {
    expect(resolveShortcut({ key: '/' }, idle).action).toBe('palette');
    expect(resolveShortcut({ key: '?', shiftKey: true }, idle).action).toBe('help');
    expect(resolveShortcut({ key: '[' }, idle).action).toBe('prev');
    expect(resolveShortcut({ key: ']' }, idle).action).toBe('next');
    expect(resolveShortcut({ key: 't' }, idle).action).toBe('theme');
    expect(resolveShortcut({ key: 'b' }, idle).action).toBe('sidebar');
  });

  it('handles the g d sequence', () => {
    const first = resolveShortcut({ key: 'g' }, idle);
    expect(first).toEqual({ action: 'none', pendingG: true });
    expect(resolveShortcut({ key: 'd' }, { ...idle, pendingG: true }).action).toBe('dashboard');
    expect(resolveShortcut({ key: 'd' }, idle).action).toBe('none');
  });

  it('maps Alt+Arrow to topic navigation', () => {
    expect(resolveShortcut({ key: 'ArrowLeft', altKey: true }, idle).action).toBe('prev');
    expect(resolveShortcut({ key: 'ArrowRight', altKey: true }, idle).action).toBe('next');
  });

  it('ignores shortcuts while typing or when a modal is open', () => {
    expect(resolveShortcut({ key: 't' }, { ...idle, typing: true }).action).toBe('none');
    expect(resolveShortcut({ key: '/' }, { ...idle, modalOpen: true }).action).toBe('none');
  });

  it('does not hijack browser combos', () => {
    expect(resolveShortcut({ key: 't', ctrlKey: true }, idle).action).toBe('none');
    expect(resolveShortcut({ key: 'b', metaKey: true }, idle).action).toBe('none');
  });

  it('detects typing targets', () => {
    expect(isTypingTarget({ tagName: 'INPUT' })).toBe(true);
    expect(isTypingTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true);
    expect(isTypingTarget({ tagName: 'BUTTON' })).toBe(false);
  });
});
