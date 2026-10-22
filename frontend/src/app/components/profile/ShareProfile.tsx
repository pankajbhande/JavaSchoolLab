import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { whatsappGeneric } from '../../lib/share';

const linkCls =
  'inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';

/** Copy-link button plus LinkedIn / X / WhatsApp share links. */
export function ShareProfile({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${name} on JavaSchoolLab`;
  const enc = encodeURIComponent;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Share profile">
      <button type="button" onClick={copy} className={`${linkCls} gap-1.5`}>
        {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Share2 className="h-3.5 w-3.5" aria-hidden />Share</span>
      <a className={linkCls} target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}>LinkedIn</a>
      <a className={linkCls} target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`}>X</a>
      <a className={linkCls} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${enc(whatsappGeneric(text, 'Free Java lessons, quizzes and daily streaks on JavaSchoolLab. Have a look at my learning journey! 🚀', url, 'See my profile'))}`}>WhatsApp</a>
    </div>
  );
}
