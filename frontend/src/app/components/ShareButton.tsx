import { useEffect, useRef, useState } from 'react';
import { Share2, Link2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CHANNELS, canonicalCourseUrl, canonicalTopicUrl, shareLink, shareText, type ShareChannel } from '../lib/share';
import { track } from '../services/analytics';

const btn =
  'h-12 w-12 sm:h-9 sm:w-9 rounded-2xl sm:rounded-lg grid place-items-center border border-orange-200 shadow-sm sm:shadow-none dark:border-orange-900/50 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500';

/**
 * "Share this topic". On phones the system share sheet opens (WhatsApp, Instagram, Messages and so on, whatever is installed). Elsewhere a
 * small menu offers WhatsApp, Telegram, LinkedIn, X, Facebook, email and Copy link. The link is the topic's own address, so the friend
 * lands on the same lesson; the preview they see in the chat is made by the server (see SharePageService).
 */
const chipBtn =
  'h-8 w-8 rounded-full grid place-items-center border border-orange-200 bg-white/95 text-orange-600 shadow-sm hover:bg-orange-50 dark:border-orange-900/50 dark:bg-gray-800/95 dark:text-orange-400 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500';

interface ShareButtonProps {
  courseName: string;
  /** Required for a topic share; for a course share it is ignored. */
  topicName?: string;
  /** 'course' shares the whole course (needs courseId); the default shares the lesson that is open. */
  kind?: 'topic' | 'course';
  courseId?: string;
  /** 'tile' is the lesson toolbar button; 'chip' is a small round button for cards and headers. */
  variant?: 'tile' | 'chip';
  /** Which side the menu opens towards, so it stays inside the screen. */
  menuAlign?: 'left' | 'right';
}

export function ShareButton({ topicName = '', courseName, kind = 'topic', courseId, variant = 'tile', menuAlign = 'right' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  const isCourse = kind === 'course' && !!courseId;
  const what = isCourse ? 'course' : 'topic';
  const payload = () => isCourse
    ? { url: canonicalCourseUrl(window.location.origin, courseId!), topicName: courseName, courseName, kind: 'course' as const }
    : { url: canonicalTopicUrl(window.location.origin, window.location.pathname), topicName, courseName };
  const record = (channel: string) => track('share', { path: window.location.pathname, detail: channel });

  const onClick = async () => {
    const p = payload();
    if (typeof navigator.share === 'function' && window.matchMedia?.('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: `${isCourse ? courseName : topicName} on JavaSchoolLab`, text: shareText(p), url: p.url });
        record('system');
      } catch { /* the person closed the sheet: nothing to do */ }
      return;
    }
    setOpen(o => !o);
  };

  const copy = async () => {
    const p = payload();
    try {
      await navigator.clipboard.writeText(p.url);
      setCopied(true);
      toast.success('Link copied. Paste it to your friends!');
      record('copy');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', p.url);
    }
    setOpen(false);
  };

  const openChannel = (c: ShareChannel) => {
    const link = shareLink(c, payload());
    if (c === 'email') window.location.href = link;
    else window.open(link, '_blank', 'noopener,noreferrer');
    record(c);
    setOpen(false);
  };

  return (
    <div className="relative" ref={box}>
      <button type="button" onClick={e => { e.stopPropagation(); onClick(); }} className={variant === 'chip' ? chipBtn : btn} title={`Share this ${what} with friends`} aria-label={`Share this ${what} with friends`} aria-haspopup="menu" aria-expanded={open}>
        <Share2 className={variant === 'chip' ? 'w-4 h-4' : 'w-5 h-5 sm:w-4 sm:h-4'} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" aria-label={`Share this ${what}`} onClick={e => e.stopPropagation()} className={`absolute ${menuAlign === 'left' ? 'left-0' : 'right-0'} z-40 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1.5 shadow-xl`}>
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Share with friends</p>
          {CHANNELS.map(c => (
            <button key={c.id} role="menuitem" type="button" onClick={() => openChannel(c.id)}
              className="w-full text-left rounded-lg px-2.5 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:bg-orange-50 dark:focus-visible:bg-gray-700">
              {c.label}
            </button>
          ))}
          <button role="menuitem" type="button" onClick={copy}
            className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-gray-100 dark:border-gray-700 px-2.5 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:bg-orange-50 dark:focus-visible:bg-gray-700">
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Link2 className="w-4 h-4" aria-hidden="true" />} Copy link
          </button>
        </div>
      )}
    </div>
  );
}
