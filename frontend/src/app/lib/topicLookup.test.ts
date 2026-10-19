import { describe, expect, it } from 'vitest';
import { courseTitle, topicTitle } from './topicLookup';
import { courseIndex } from '../data/courseIndex';

const index = [{ id: 'html-and-css', name: 'HTML and CSS', icon: 'Code', subTopics: [{ id: 'intro', name: 'Intro', topics: [{ id: 'introhtmlandcss', name: 'Introduction to HTML and CSS' }] }] }];

describe('topicTitle', () => {
  it('turns an id into the topic name from the course index', () => {
    expect(topicTitle('html-and-css', 'introhtmlandcss', index)).toBe('Introduction to HTML and CSS');
    expect(courseTitle('html-and-css', index)).toBe('HTML and CSS');
  });

  it('tidies an id the index does not know instead of showing it raw', () => {
    expect(topicTitle('x', 'some-unknown_topic', index)).toBe('Some unknown topic');
    expect(topicTitle('x', '', index)).toBe('');
    expect(courseTitle('nope', index)).toBeUndefined();
  });

  it('knows the real topics of the site', () => {
    const c = courseIndex[0];
    const t = c.subTopics[0].topics[0];
    expect(topicTitle(c.id, t.id)).toBe(t.name);
  });
});
