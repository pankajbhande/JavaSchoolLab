// Presentation transform that makes every course read as point-wise notes.
//
//  - runs of "• text" lines (separated by <br> or newlines) become a real <ul>, with key terms highlighted
//  - the short lead label of a list item ("Secure: ..." or "<strong>JVM</strong> (Java Virtual Machine): ...") is
//    highlighted whole, up to the colon, so points can be scanned
//
// <pre>, <table>, <script> and <style> regions are never touched, and so are lines that are not bullets.
// The source data is untouched; this runs on the way to the screen.
import { highlight } from '../data/topics/courseExtras/javaLayout';

const BULLET = /^(?:•|&bull;|&#8226;)\s*([\s\S]+)$/;
const PROTECTED = /<(pre|table|script|style|ul|ol)\b[\s\S]*?<\/\1>/gi;

export function bulletRuns(html: string): string {
  if (!/•|&bull;|&#8226;/.test(html)) return html;
  const keep: string[] = [];
  const guarded = html.replace(PROTECTED, m => { keep.push(m); return `@@KEEP${keep.length - 1}@@`; });
  const parts = guarded.split(/(<br\s*\/?>\s*|\n)/i);
  let out = '';
  let open = false;
  for (let i = 0; i < parts.length; i += 2) {
    const line = parts[i];
    const sep = parts[i + 1] ?? '';
    const m = line.trim().match(BULLET);
    if (m) {
      if (!open) { out += '<ul>'; open = true; }
      out += `<li>${highlight(m[1].trim())}</li>`;
    } else if (open && line.trim() === '') {
      // blank line inside a run of bullets: keep the list going
    } else {
      if (open) { out += '</ul>'; open = false; }
      out += line + sep;
    }
  }
  if (open) out += '</ul>';
  return out.replace(/@@KEEP(\d+)@@/g, (_m, i) => keep[Number(i)]);
}

/** Bolds a short lead label ("Secure: ...") at the start of a list item or a paragraph ("Real-world: ..."). */
export function boldLabels(html: string): string {
  return html
    // "<strong>JVM</strong> (Java Virtual Machine):" -> one chip covering the whole label up to the colon
    .replace(/<li>(\s*)<strong>((?:(?!<\/strong>)[\s\S])+)<\/strong>(\s*\([^()]{1,400}\))?(\s*):(?=\s)/g,
      (_m, ws, term, expansion = '', gap) => `<li>${ws}<strong>${term}${expansion}${gap}:</strong>`)
    .replace(/<li>(\s*)([^:<.,]{2,50}?):(?=\s)/g, '<li>$1<strong>$2:</strong>')
    .replace(/<p>(\s*)([^:<.,]{2,30}?):(?=\s)/g, '<p>$1<strong>$2:</strong>');
}

/**
 * A sentence that ends with a colon and introduces a list ("Java is secure because of these points:")
 * becomes a highlighted lead-in so the eye lands on it before the points.
 */
export function leadIns(html: string): string {
  return html.replace(/<p>((?:(?!<\/p>)[\s\S])*?:)\s*<\/p>(\s*<(?:ul|ol)\b)/gi, '<p class="jsl-lead">$1</p>$2');
}

export function formatNotes(html: string): string {
  return leadIns(boldLabels(bulletRuns(html)));
}
