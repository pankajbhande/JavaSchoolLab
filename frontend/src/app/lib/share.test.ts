import { describe, expect, it } from 'vitest';
import { CHANNELS, canonicalCourseUrl, canonicalTopicUrl, shareLink, shareText, whatsappText } from './share';

const p = { url: 'https://javaschoollab.com/course/java/basics/constructor-chaining', topicName: 'Constructor Chaining', courseName: 'Java' };

describe('share links', () => {
  it('uses the site origin and the topic path, never the query string or fragment', () => {
    expect(canonicalTopicUrl('https://javaschoollab.com/', '/course/java/basics/x?level=expert#top')).toBe('https://javaschoollab.com/course/java/basics/x');
    expect(canonicalTopicUrl('http://localhost:3001', '/course/java')).toBe('http://localhost:3001/course/java');
  });

  it('says what the topic is', () => {
    expect(shareText(p)).toContain('Constructor Chaining');
    expect(shareText(p)).toContain('Java');
  });

  it('builds a working link for every channel, with the topic address inside', () => {
    for (const c of CHANNELS) {
      const link = shareLink(c.id, p);
      expect(link).toMatch(/^(https:\/\/|mailto:)/);
      expect(decodeURIComponent(link)).toContain(p.url);
    }
  });

  it('puts the message and the link together for WhatsApp', () => {
    const link = shareLink('whatsapp', p);
    expect(link.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(link.slice('https://wa.me/?text='.length))).toBe(whatsappText(p));
    expect(whatsappText(p).endsWith(`\n${p.url}`)).toBe(true);
  });

  it('encodes characters that would break the link', () => {
    const odd = { url: 'https://javaschoollab.com/course/java/a/b', topicName: 'Q&A: "if" & else <tags>', courseName: 'C&C++' };
    const link = shareLink('telegram', odd);
    expect(link).not.toContain(' ');
    expect(link).not.toContain('<');
    expect(link).not.toContain('"');
    expect(link.split('&').length).toBe(2);             // only the url= / text= separator, every other & is encoded
    expect(decodeURIComponent(link)).toContain('Q&A: "if" & else <tags>');
  });

  it('shares a whole course: its own address, text and email subject', () => {
    expect(canonicalCourseUrl('https://javaschoollab.com/', 'javafx')).toBe('https://javaschoollab.com/course/javafx');
    expect(canonicalCourseUrl('https://javaschoollab.com', 'HTML and CSS')).toBe('https://javaschoollab.com/course/HTML_and_CSS');
    const c = { url: 'https://javaschoollab.com/course/javafx', topicName: 'JavaFX', courseName: 'JavaFX', kind: 'course' as const };
    expect(shareText(c)).toContain('JavaFX: a complete free course on JavaSchoolLab');
    expect(shareLink('email', c)).toContain(encodeURIComponent('JavaFX on JavaSchoolLab'));
    expect(shareLink('whatsapp', c)).toContain(encodeURIComponent('https://javaschoollab.com/course/javafx'));
  });
});
