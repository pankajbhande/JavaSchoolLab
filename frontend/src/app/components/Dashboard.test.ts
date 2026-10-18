import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { courseStats } from '../data/courseStats';

// The dashboard card list is hand-written. Every course must be reachable from it, and every card
// must open a course that exists; a card with a wrong id silently opens nothing.
const source = fs.readFileSync(path.resolve(__dirname, 'Dashboard.tsx'), 'utf8');
const cardIds = [...source.matchAll(/^ {4}id: '([^']+)'/gm)].map(m => m[1]);

describe('dashboard course cards', () => {
  it('has a card for every course', () => {
    const missing = Object.keys(courseStats).filter(id => !cardIds.includes(id));
    expect(missing, `courses with no dashboard card: ${missing.join(', ')}`).toEqual([]);
  });

  it('points every card at a real course, once', () => {
    const unknown = cardIds.filter(id => !courseStats[id]);
    expect(unknown, `cards with an unknown course id: ${unknown.join(', ')}`).toEqual([]);
    expect(new Set(cardIds).size).toBe(cardIds.length);
  });
});
