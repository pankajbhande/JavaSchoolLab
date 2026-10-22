import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, LogOut, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { deleteMyAccount, downloadMyData, signOutEverywhere } from '../../services/api';

const card = 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 p-5';
const input =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400';
const secondary =
  'inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60';

/** The account owner's own controls: download the data, sign out everywhere, delete the account. */
export function PrivacyCard() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState<'' | 'download' | 'signout' | 'delete'>('');
  const [confirmText, setConfirmText] = useState('');
  const [open, setOpen] = useState(false);
  const identity = user?.email || user?.mobile || '';

  const run = async (kind: 'download' | 'signout' | 'delete', work: () => Promise<void>, done: string) => {
    setBusy(kind);
    try {
      await work();
      toast.success(done);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      setBusy('');
      return false;
    }
    setBusy('');
    return true;
  };

  return (
    <section className={`${card} space-y-4 self-start`} aria-labelledby="privacy-heading">
      <h3 id="privacy-heading" className="font-semibold text-gray-800 dark:text-gray-100">Your data and security</h3>
      <p className="text-xs text-gray-600 dark:text-gray-300">
        Read how your data is used in the <Link to="/privacy" className="underline text-orange-700 dark:text-orange-300">Privacy Policy</Link> and the{' '}
        <Link to="/terms" className="underline text-orange-700 dark:text-orange-300">Terms of Use</Link>.
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy !== ''} className={secondary}
          onClick={() => run('download', downloadMyData, 'Your data was downloaded')}>
          <Download className="h-4 w-4" aria-hidden /> Download my data
        </button>
        <button type="button" disabled={busy !== ''} className={secondary}
          onClick={async () => { if (await run('signout', signOutEverywhere, 'Signed out of all devices')) logout(); }}>
          <LogOut className="h-4 w-4" aria-hidden /> Sign out of all devices
        </button>
      </div>

      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20 p-4">
        <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Delete my account</h4>
        <p className="mt-1 text-xs text-red-800/90 dark:text-red-200/90">
          Permanently removes your account, progress, notes, bookmarks, quiz history, badges, public profile and certificates. This cannot be undone.
        </p>
        {!open ? (
          <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-800 px-4 py-2 text-sm font-semibold text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/40"
            onClick={() => setOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden /> Delete my account…
          </button>
        ) : (
          <form className="mt-3 space-y-2"
            onSubmit={async e => {
              e.preventDefault();
              if (await run('delete', () => deleteMyAccount(confirmText), 'Your account was deleted')) logout();
            }}>
            <label htmlFor="del-confirm" className="block text-xs font-medium text-red-900 dark:text-red-200">
              Type your sign-in address <strong>{identity}</strong> to confirm
            </label>
            <input id="del-confirm" className={input} value={confirmText} onChange={e => setConfirmText(e.target.value)} autoComplete="off" required />
            <div className="flex gap-2">
              <button type="submit" disabled={busy !== '' || confirmText.trim().toLowerCase() !== identity.toLowerCase()}
                className="rounded-lg bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2">
                {busy === 'delete' ? 'Deleting…' : 'Delete everything'}
              </button>
              <button type="button" className={secondary} onClick={() => { setOpen(false); setConfirmText(''); }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
