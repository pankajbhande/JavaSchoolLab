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
  if (p.kind === 'course') return `📚 ${p.courseName}: a complete free course on JavaSchoolLab, with lessons, worked examples, quizzes and interview questions.`;
  return `📘 ${p.topicName} (${p.courseName}): a clear, free lesson on JavaSchoolLab with worked examples and interview questions. 🚀`;
}

/** The WhatsApp message: a bold title, one friendly line, then the link on its own line so WhatsApp shows the preview card under it. */
export function whatsappText(p: SharePayload): string {
  if (p.kind === 'course') {
    return `📚 *${p.courseName}: complete free course*\nStep-by-step lessons, worked examples, quizzes and interview questions on JavaSchoolLab.\n\n👉 Start learning:\n${p.url}`;
  }
  return `📘 *${p.topicName}* (${p.courseName})\nA clear, free lesson with worked examples and interview questions on JavaSchoolLab. Give it a read, it feels good to learn this! 🚀\n\n👉 Read it here:\n${p.url}`;
}

/** Friendly WhatsApp message for any other link (a profile, an achievement, the site itself): bold headline, one line, the link last. */
export function whatsappGeneric(headline: string, line: string, url: string, cta = 'Take a look'): string {
  return `✨ *${headline}*
${line}

👉 ${cta}:
${url}`;
}

/** The address that opens each app with the message ready to send. Every value is URL-encoded. */
export function shareLink(channel: ShareChannel, p: SharePayload): string {
  const text = shareText(p);
  const u = encodeURIComponent(p.url);
  const t = encodeURIComponent(text);
  switch (channel) {
    case 'whatsapp': return `https://wa.me/?text=${encodeURIComponent(whatsappText(p))}`;
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
