// Key-term highlighter for notes HTML. Plain text helper, independent of the course data.

export const MARK = '<mark style="background:#fde68a;color:#1f2937;padding:0 4px;border-radius:3px;font-weight:600">';

/** Highlights key terms: tagged <code>/<b> text and identifiers such as camelCase names, Dotted.names and ALL_CAPS. */
export function highlight(html: string): string {
    const terms = /\b(?:[A-Za-z_]+(?:\.[A-Za-z_]+)+(?:\(\))?|[a-z]+[A-Z][A-Za-z]*(?:\(\))?|[A-Z][a-z]+[A-Z][A-Za-z]*|[A-Z]{3,}[A-Za-z0-9]*|[A-Za-z]+\(\))/g;
    return html
        .replace(/<(code|b)>([\s\S]*?)<\/\1>/g, (_m, tag, inner) => `${MARK}<${tag}>${inner}</${tag}></mark>`)
        .split(/(<[^>]+>)/)
        .map((part, i, arr) => {
            if (part.startsWith('<')) return part;
            // do not touch text already inside a highlight
            const before = arr.slice(0, i).join('');
            if ((before.match(/<mark/g) ?? []).length > (before.match(/<\/mark>/g) ?? []).length) return part;
            return part.replace(terms, t => `${MARK}${t}</mark>`);
        })
        .join('');
}
