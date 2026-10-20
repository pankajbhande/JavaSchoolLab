import { useEffect, useState } from 'react';
import { Bookmark, StickyNote, X, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { ShareButton } from './ShareButton';
import {
  TopicRef, fetchBookmarks, addBookmark, removeBookmark, fetchNotes, saveNote,
} from '../services/api';

const btn =
  'h-12 w-12 sm:h-9 sm:w-9 rounded-2xl sm:rounded-lg grid place-items-center border border-orange-200 shadow-sm sm:shadow-none dark:border-orange-900/50 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors';

/**
 * Bookmark + private-note controls for the open topic. Both live behind the account, so a
 * guest gets a prompt to sign in instead of a silent no-op.
 */
export function TopicToolbar({ topicRef, courseName }: { topicRef: TopicRef; courseName: string }) {
  const { isLoggedIn } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [note, setNote] = useState('');
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { courseId, topicId } = topicRef;

  useEffect(() => {
    setBookmarked(false);
    setNote('');
    if (!isLoggedIn) return;
    let cancelled = false;
    Promise.all([fetchBookmarks(), fetchNotes()])
      .then(([bms, notes]) => {
        if (cancelled) return;
        setBookmarked(bms.some(b => b.courseId === courseId && b.topicId === topicId));
        setNote(notes.find(n => n.courseId === courseId && n.topicId === topicId)?.body ?? '');
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isLoggedIn, courseId, topicId]);

  const needLogin = () => {
    toast('Login required', {
      id: 'need-login',
      icon: <Lock className="w-4 h-4 text-orange-600" />,
      description: 'Log in to save bookmarks and notes for this topic.',
      action: { label: 'Log in', onClick: () => setShowLogin(true) },
    });
  };

  const toggleBookmark = async () => {
    if (!isLoggedIn) return needLogin();
    const next = !bookmarked;
    setBookmarked(next);
    try {
      if (next) await addBookmark(topicRef);
      else await removeBookmark({ courseId, topicId });
      toast.success(next ? 'Bookmarked' : 'Bookmark removed');
    } catch {
      setBookmarked(!next);
      toast.error('Could not update bookmark');
    }
  };

  const openNote = () => {
    if (!isLoggedIn) return needLogin();
    setDraft(note);
    setOpen(true);
  };

  const submitNote = async () => {
    setSaving(true);
    try {
      await saveNote({ ...topicRef, body: draft });
      setNote(draft.trim() === '' ? '' : draft);
      setOpen(false);
      toast.success(draft.trim() === '' ? 'Note deleted' : 'Note saved');
    } catch {
      toast.error('Could not save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ShareButton topicName={topicRef.topicName} courseName={courseName} />
      <button
        onClick={toggleBookmark}
        className={btn}
        title={bookmarked ? 'Remove bookmark' : 'Bookmark this topic'}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this topic'}
        aria-pressed={bookmarked}
      >
        <Bookmark className="w-5 h-5 sm:w-4 sm:h-4" fill={bookmarked ? 'currentColor' : 'none'} />
      </button>
      <button
        onClick={openNote}
        className={`${btn} relative`}
        title={note ? 'Edit your note' : 'Add a private note'}
        aria-label={note ? 'Edit your note' : 'Add a private note'}
      >
        <StickyNote className="w-5 h-5 sm:w-4 sm:h-4" />
        {note && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Topic note"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate pr-2">
                Note — {topicRef.topicName}
              </h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              maxLength={10000}
              rows={7}
              placeholder="Write something to remember about this topic…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 p-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button
                onClick={submitNote}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} message="Log in to save bookmarks and notes" />}
    </>
  );
}
