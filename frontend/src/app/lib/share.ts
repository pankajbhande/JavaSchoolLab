// Building share links for a topic or a whole course. Pure functions, so they can be tested without a browser.

import { slugify } from './slug';

export type ShareChannel = 'whatsapp' | 'telegram' | 'linkedin' | 'x' | 'facebook' | 'email';

export interface SharePayload {
  /** The canonical topic address, e.g. https://javaschoollab.com/course/java/basics/constructor-chaining */
  url: string;
  topicName: string;
  courseName: string;
  /** 'course' shares a whole course (topicName is then the course name); the default is a single topic. */
  kind?: 'topic' | 'course';
}

/** The address people should get: this site's origin plus the topic path, without the query string or fragment. */
export function canonicalTopicUrl(origin: string, pathname: string): string {
  return origin.replace(/\/+$/, '') + pathname.split('?')[0].split('#')[0];
}

/** The address of a course landing page, e.g. https://javaschoollab.com/course/javafx */
export function canonicalCourseUrl(origin: string, courseId: string): string {
  return origin.replace(/\/+$/, '') + '/course/' + slugify(courseId);
}

export function shareText(p: SharePayload): string {
  if (p.kind === 'course') return `Learn ${p.courseName} on JavaSchoolLab: free lessons, worked examples, quizzes and interview questions.`;
  return `Learn ${p.topicName} (${p.courseName}) on JavaSchoolLab: free lessons, worked examples and interview questions.`;
}

/** The address that opens each app with the message ready to send. Every value is URL-encoded. */
export function shareLink(channel: ShareChannel, p: SharePayload): string {
  const text = shareText(p);
  const u = encodeURIComponent(p.url);
  const t = encodeURIComponent(text);
  switch (channel) {
    case 'whatsapp': return `https://wa.me/?text=${encodeURIComponent(`${text}\n${p.url}`)}`;
    case 'telegram': return `https://t.me/share/url?url=${u}&text=${t}`;
    case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'x': return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'email': return `mailto:?subject=${encodeURIComponent(`${p.kind === 'course' ? p.courseName : p.topicName} on JavaSchoolLab`)}&body=${encodeURIComponent(`${text}\n\n${p.url}`)}`;
  }
}

export const CHANNELS: { id: ShareChannel; label: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'email', label: 'Email' },
];
