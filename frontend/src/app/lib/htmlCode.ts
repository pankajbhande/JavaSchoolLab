// HTML / CSS code samples: detection, re-indenting and colouring for the lesson code blocks.

const VOID = new Set(['meta', 'link', 'br', 'hr', 'img', 'input', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr', '!doctype']);

/** True when a sample is a web page or fragment rather than Java. */
export const looksLikeHtml = (code: string) =>
  /^\s*(<!doctype\s+html|<html[\s>]|<(head|body|style|div|p|h[1-6]|a|ul|ol|table|form|img|span|button)[\s>])/i.test(code);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (color: string, text: string, extra = '') =>
  text ? `<span style="color:${color}${extra}">${esc(text)}</span>` : '';

/**
 * Re-indent an HTML sample from its nesting: two spaces per open tag, and inside <style>
 * per CSS brace. Existing indentation is discarded, since pasted samples are often ragged.
 */
export function formatHtml(code: string): string {
  const out: string[] = [];
  let depth = 0;
  let inStyle = false;
  for (const raw of code.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) { out.push(''); continue; }

    if (inStyle && !/^<\/style/i.test(line)) {
      const lead = /^\}/.test(line) ? 1 : 0;
      depth = Math.max(0, depth - lead);
      out.push('  '.repeat(depth) + line);
      depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length + lead;
      continue;
    }

    if (/^<\//.test(line)) depth = Math.max(0, depth - 1);
    out.push('  '.repeat(depth) + line);

    // Net change from the tags on this line, ignoring any closing tag that leads it.
    const rest = /^<\//.test(line) ? line.replace(/^<\/[^>]*>/, '') : line;
    for (const m of rest.matchAll(/<(\/?)([a-z!][\w:-]*)[^>]*?(\/?)>/gi)) {
      const name = m[2].toLowerCase();
      if (m[1]) depth = Math.max(0, depth - 1);
      else if (!VOID.has(name) && !m[3]) depth++;
    }
    if (/^<style[\s>]/i.test(line) && !/<\/style>/i.test(line)) inStyle = true;
    if (/^<\/style/i.test(line)) inStyle = false;
  }
  return out.join('\n');
}

function highlightCss(src: string): string {
  let out = '';
  for (const m of src.matchAll(/(\/\*[\s\S]*?\*\/)|([^{}]*)(\{)|([^{}]+)|([{}])/g)) {
    if (m[1]) out += span('#7f848e', m[1], ';font-style:italic');
    else if (m[3]) out += span('#e5c07b', m[2]) + span('#abb2bf', '{');
    else if (m[5]) out += span('#abb2bf', m[5]);
    else {
      out += m[4].replace(/([\w-]+)(\s*:)([^;]*)(;?)|(\s+|;|[^;\s]+)/g,
        (_: string, p?: string, c?: string, v?: string, semi?: string, other?: string) => {
          if (p === undefined) return esc(other ?? '');
          const val = esc(v ?? '').replace(/(#[0-9a-f]{3,8}\b|-?\d*\.?\d+)([a-z%]*)/gi, '<span style="color:#c678dd">$1$2</span>');
          return span('#e06c75', p) + span('#abb2bf', c ?? '') + `<span style="color:#d19a66">${val}</span>` + span('#abb2bf', semi ?? '');
        });
    }
  }
  return out;
}

export function highlightHtml(src: string): string {
  let out = '';
  let i = 0;
  const tagRe = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?[a-z][\w:-]*(?:"[^"]*"|'[^']*'|[^'">])*>/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(src))) {
    out += esc(src.slice(i, m.index));
    const t = m[0];
    if (t.startsWith('<!--')) out += span('#7f848e', t, ';font-style:italic');
    else if (/^<!doctype/i.test(t)) out += span('#7f848e', t);
    else {
      const p = /^(<\/?)([\w:-]+)([\s\S]*?)(\/?>)$/.exec(t)!;
      out += span('#abb2bf', p[1]) + span('#e5c07b', p[2]) +
        p[3].replace(/([\w:@.-]+)(\s*=\s*)?("[^"]*"|'[^']*'|[^\s"'>]+)?|(\s+)/g,
          (_: string, n?: string, eq?: string, val?: string, ws?: string) =>
            ws ?? span('#d19a66', n ?? '') + (eq ? span('#abb2bf', eq) : '') + (val ? span('#98c379', val) : '')) +
        span('#abb2bf', p[4]);
      const name = p[2].toLowerCase();
      if (p[1] === '<' && (name === 'style' || name === 'script')) {
        let close = src.toLowerCase().indexOf('</' + name, tagRe.lastIndex);
        if (close < 0) close = src.length;
        const body = src.slice(tagRe.lastIndex, close);
        out += name === 'style' ? highlightCss(body) : esc(body);
        tagRe.lastIndex = close;
      }
    }
    i = tagRe.lastIndex;
  }
  return out + esc(src.slice(i));
}
