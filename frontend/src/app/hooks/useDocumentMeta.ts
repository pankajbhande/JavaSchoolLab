import { useEffect } from 'react';

/**
 * Per-route document metadata.
 *
 * The app is a single index.html, so every one of the 474 topics previously shared one
 * title and one description. Search results, browser history, shared links and bookmarks
 * were all indistinguishable. This sets the head tags for whatever is currently on screen.
 *
 * Note this is client-side: crawlers that execute JS will see it, but a proper
 * prerender/SSR step is still what makes the whole catalogue reliably indexable.
 * The sitemap (npm run gen:sitemap) is what tells crawlers the URLs exist in the meantime.
 */

const SITE_NAME = 'JavaSchoolLab';

function setTag(selector: string, create: () => HTMLElement, value: string, attr = 'content') {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function meta(name: string, value: string) {
  setTag(`meta[name="${name}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('name', name);
    return el;
  }, value);
}

function property(prop: string, value: string) {
  setTag(`meta[property="${prop}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('property', prop);
    return el;
  }, value);
}

function canonical(href: string) {
  setTag('link[rel="canonical"]', () => {
    const el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    return el;
  }, href, 'href');
}

/** Strips HTML and trims to a sentence boundary near `max` so descriptions do not end mid-word. */
export function toDescription(html: string, max = 155): string {
  const text = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(' '));
  return (lastStop > max * 0.6 ? cut.slice(0, lastStop) : cut).trim() + '…';
}

export interface DocumentMeta {
  title: string;
  description: string;
  /** Absolute or root-relative path for the canonical link. */
  path?: string;
  /** JSON-LD injected as a single script tag, replaced on every change. */
  jsonLd?: Record<string, unknown> | null;
}

export function useDocumentMeta({ title, description, path, jsonLd }: DocumentMeta) {
  useEffect(() => {
    const full = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = full;

    meta('description', description);
    property('og:title', full);
    property('og:description', description);
    property('og:site_name', SITE_NAME);
    property('og:type', 'article');
    meta('twitter:card', 'summary_large_image');
    meta('twitter:title', full);
    meta('twitter:description', description);

    const href = path
      ? new URL(path, window.location.origin).toString()
      : window.location.href.split('?')[0];
    canonical(href);
    property('og:url', href);

    const SCRIPT_ID = 'jsl-structured-data';
    document.getElementById(SCRIPT_ID)?.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = SCRIPT_ID;
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, path, jsonLd]);
}
