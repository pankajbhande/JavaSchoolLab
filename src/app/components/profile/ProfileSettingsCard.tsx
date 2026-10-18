import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Globe, Loader2, Lock, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchProfileSettings, saveProfileSettings, checkHandleAvailable, type ProfileSettings,
} from '../../services/api';
import { BIO_MAX, DISPLAY_NAME_MAX, HANDLE_MAX, bioError, handleError, normalizeHandle, profileUrl } from '../../lib/profileHandle';
import { siteUrl } from '../../lib/siteUrl';

const card = 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 p-5';
const input =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500';
const label = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

type Avail = { kind: 'idle' } | { kind: 'checking' } | { kind: 'ok' } | { kind: 'bad'; reason: string };

const SECTIONS: { key: 'showCertificates' | 'showStats' | 'showBadges' | 'showProgress'; title: string; detail: string }[] = [
  { key: 'showCertificates', title: 'Certificates', detail: 'Module, course, score and date of each certificate, each with a link to its public verification page.' },
  { key: 'showStats', title: 'Streak and study stats', detail: 'Current and longest streak, level and XP, topics opened, modules passed and total study time.' },
  { key: 'showBadges', title: 'Badges', detail: 'The badges you have earned.' },
  { key: 'showProgress', title: 'Course progress', detail: 'How many topics you have opened in each course.' },
];

function Toggle({ checked, onChange, id, children }: { checked: boolean; onChange: (v: boolean) => void; id: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-orange-600 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500 peer-focus-visible:ring-offset-2 dark:bg-gray-600 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
      <span className="min-w-0 text-sm">{children}</span>
    </label>
  );
}

export function ProfileSettingsCard() {
  const [saved, setSaved] = useState<ProfileSettings | null>(null);
  const [form, setForm] = useState<ProfileSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avail, setAvail] = useState<Avail>({ kind: 'idle' });
  const [serverError, setServerError] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    fetchProfileSettings().then(s => { setSaved(s); setForm(s); }).catch(() => setLoadError(true));
  }, []);

  const handle = form ? normalizeHandle(form.handle) : '';
  const localProblem = form && handle ? handleError(handle) : null;

  // Live availability, debounced; stale responses are ignored.
  useEffect(() => {
    if (!form || !handle) { setAvail({ kind: 'idle' }); return; }
    if (localProblem) { setAvail({ kind: 'bad', reason: localProblem }); return; }
    if (saved && handle === saved.handle) { setAvail({ kind: 'ok' }); return; }
    const mine = ++seq.current;
    const ctrl = new AbortController();
    setAvail({ kind: 'checking' });
    const t = window.setTimeout(() => {
      checkHandleAvailable(handle, ctrl.signal)
        .then(r => { if (seq.current === mine) setAvail(r.available ? { kind: 'ok' } : { kind: 'bad', reason: r.reason || 'Not available' }); })
        .catch(() => { if (seq.current === mine && !ctrl.signal.aborted) setAvail({ kind: 'idle' }); });
    }, 350);
    return () => { window.clearTimeout(t); ctrl.abort(); };
  }, [handle, localProblem, saved, form !== null]);

  if (loadError) return <section className={card}><p className="text-sm text-gray-600 dark:text-gray-300">Could not load your public profile settings. Is the server running?</p></section>;
  if (!form || !saved) return <section className={card}><p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p></section>;

  const set = <K extends keyof ProfileSettings>(k: K, v: ProfileSettings[K]) => { setServerError(null); setForm({ ...form, [k]: v }); };
  const bioProblem = bioError(form.bio);
  const dirty = JSON.stringify({ ...form, handle }) !== JSON.stringify(saved);
  const needsHandle = form.isPublic && !handle;
  const blocked = !!bioProblem || needsHandle || (!!handle && avail.kind !== 'ok') || (form.isPublic && !!localProblem);
  const link = saved.isPublic && saved.handle ? profileUrl(siteUrl(), saved.handle) : null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setServerError(null);
    try {
      const next = await saveProfileSettings({ ...form, handle });
      setSaved(next);
      setForm(next);
      toast.success(next.isPublic ? 'Public profile saved' : 'Your profile is private');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not save';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className={`${card} space-y-5 lg:col-span-2`} aria-labelledby="pp-title">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
          {saved.isPublic ? <Globe className="h-5 w-5" aria-hidden /> : <Lock className="h-5 w-5" aria-hidden />}
        </div>
        <div className="min-w-0">
          <h3 id="pp-title" className="font-semibold text-gray-800 dark:text-gray-100">Public profile</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Off by default. When on, anyone with the link can see the page below, without signing in.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/20 dark:text-orange-100">
        <p className="font-semibold">What becomes public if you publish</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>Always: your handle, your display name (your full name unless you set another), your bio and the month you joined.</li>
          <li>Only the sections you switch on below.</li>
          <li>Never: your email, mobile number, date of birth, college or company.</li>
        </ul>
        <p className="mt-1">Turn the profile off at any time and the page disappears immediately.</p>
      </div>

      <Toggle id="pp-public" checked={form.isPublic} onChange={v => set('isPublic', v)}>
        <span className="font-semibold text-gray-800 dark:text-gray-100">Publish my profile</span>
        <span className="block text-xs text-gray-600 dark:text-gray-300">{form.isPublic ? 'Visible to anyone with the link once saved.' : 'Private. Nobody can open a page for you.'}</span>
      </Toggle>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="pp-handle">Handle</label>
          <div className="relative">
            <input
              id="pp-handle" className={`${input} pr-9`} value={form.handle} maxLength={HANDLE_MAX + 5}
              autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="e.g. asha_k"
              aria-describedby="pp-handle-msg" aria-invalid={avail.kind === 'bad'}
              onChange={e => set('handle', e.target.value.toLowerCase().replace(/\s/g, ''))}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2" aria-hidden>
              {avail.kind === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              {avail.kind === 'ok' && <Check className="h-4 w-4 text-emerald-600" />}
              {avail.kind === 'bad' && <X className="h-4 w-4 text-red-600" />}
            </span>
          </div>
          <p id="pp-handle-msg" aria-live="polite" className={`mt-1 text-xs ${avail.kind === 'bad' ? 'text-red-700 dark:text-red-400' : avail.kind === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {avail.kind === 'bad' ? avail.reason
              : avail.kind === 'ok' ? (handle === saved.handle ? 'This is your handle' : 'Available')
              : avail.kind === 'checking' ? 'Checking…'
              : needsHandle ? 'Choose a handle to publish'
              : `3 to ${HANDLE_MAX} characters: lowercase letters, digits, - and _`}
          </p>
        </div>
        <div>
          <label className={label} htmlFor="pp-dn">Display name (optional)</label>
          <input id="pp-dn" className={input} value={form.displayName} maxLength={DISPLAY_NAME_MAX} placeholder="Defaults to your full name" onChange={e => set('displayName', e.target.value)} />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use a nickname or first name if you prefer.</p>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="pp-bio">Bio (optional, plain text)</label>
        <textarea id="pp-bio" rows={3} className={input} value={form.bio} onChange={e => set('bio', e.target.value)} />
        <p className={`mt-1 text-xs tabular-nums ${bioProblem ? 'text-red-700 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{form.bio.length}/{BIO_MAX}{bioProblem && ` - ${bioProblem}`}</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">What to show</legend>
        {SECTIONS.map(s => (
          <Toggle key={s.key} id={`pp-${s.key}`} checked={form[s.key]} onChange={v => set(s.key, v)}>
            <span className="font-medium text-gray-800 dark:text-gray-100">{s.title}</span>
            <span className="block text-xs text-gray-600 dark:text-gray-300">{s.detail}</span>
          </Toggle>
        ))}
      </fieldset>

      {serverError && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{serverError}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={saving || !dirty || blocked} className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save public profile'}
        </button>
        {link && (
          <div className="min-w-0 text-sm">
            <span className="text-gray-600 dark:text-gray-300">Live at </span>
            <Link to={`/u/${saved.handle}`} className="break-all font-semibold text-orange-700 underline dark:text-orange-400">{link}</Link>
          </div>
        )}
      </div>
    </form>
  );
}
