import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const level = { number: 1, name: 'Torna', saying: 's', xp: 0, fromXp: 0, toXp: 100, percent: 0, nextName: 'Sinhagad', maxed: false };
const answer = (newlyEarned: unknown[] = []) => ({ level, levels: [], badges: [], totalEarned: 0, totalBadges: 0, newlyEarned });
const reply = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } }));
const badge = (id: string) => ({ id, kind: 'badge', name: id, description: '', icon: 'star', message: 'well done' });

describe('achievements store', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('localStorage', { getItem: () => 'token', setItem() {}, removeItem() {} });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('keeps the latest answer for the pages that show levels and badges', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(answer())));
    const m = await import('./achievements');
    expect(m.getLatestAchievements()).toBeNull();
    await m.refreshAchievements();
    expect(m.getLatestAchievements()?.level.name).toBe('Torna');
  });

  it('hands each new badge to the celebration once, whichever part of the site asked the server', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(answer([badge('first-step')]))));
    const m = await import('./achievements');
    await m.refreshAchievements();                       // e.g. the dashboard asked first
    expect(m.takeNewBadges().map(b => b.id)).toEqual(['first-step']);
    expect(m.takeNewBadges()).toEqual([]);               // already handed out
  });

  it('does not queue the same badge twice, and keeps badges earned one after the other', async () => {
    const f = vi.fn()
      .mockImplementationOnce(() => reply(answer([badge('a')])))
      .mockImplementationOnce(() => reply(answer([badge('a'), badge('b')])));
    vi.stubGlobal('fetch', f);
    const m = await import('./achievements');
    await m.refreshAchievements();
    await m.refreshAchievements();
    expect(m.takeNewBadges().map(b => b.id)).toEqual(['a', 'b']);
  });

  it('tells subscribers when something changes, and forgets everything on sign-out', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(answer([badge('x')]))));
    const m = await import('./achievements');
    const seen = vi.fn();
    const off = m.subscribeAchievements(seen);
    await m.refreshAchievements();
    expect(seen).toHaveBeenCalledTimes(1);
    m.resetAchievements();
    expect(m.getLatestAchievements()).toBeNull();
    expect(m.takeNewBadges()).toEqual([]);
    expect(seen).toHaveBeenCalledTimes(2);
    off();
    m.resetAchievements();
    expect(seen).toHaveBeenCalledTimes(2);
  });

  it('says what the learner did in the first person, for sharing', async () => {
    const m = await import('./achievements');
    expect(m.winText({ name: 'On Fire', kind: 'badge' })).toContain('"On Fire" badge');
    expect(m.winText({ name: 'Level 2: Sinhagad', kind: 'level' })).toContain('reached Level 2: Sinhagad');
  });
});
