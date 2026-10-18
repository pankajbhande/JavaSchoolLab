import { describe, it, expect } from 'vitest';
import { splitInterview } from './interviewQA';
import { coursesData } from '../../coursesData';

describe('splitInterview', () => {
  it('reads a Question | Answer table and keeps other tables', () => {
    const html = `<h3>Interview Questions / Common Traps</h3><table><tr><th>Question / Scenario</th><th>Answer</th></tr>
<tr><td>Does <b>continue</b> stop the loop?</td><td>No &amp; it only skips</td></tr></table>
<h3>Quick Summary</h3><table><tr><th>Statement</th><th>Effect</th></tr><tr><td>break</td><td>exits</td></tr></table>`;
    const { qa, rest } = splitInterview(html);
    expect(qa).toEqual([['Does continue stop the loop?', 'No & it only skips']]);
    expect(rest).toContain('Quick Summary');
    expect(rest).not.toMatch(/Interview|Common Traps/);
  });

  it('reads Q. paragraphs', () => {
    const { qa, rest } = splitInterview('<h3>Interview Questions &amp; Answers</h3><p><b>Q. What is X?</b><br/>It is Y.</p>');
    expect(qa).toEqual([['What is X?', 'It is Y.']]);
    expect(rest).toBe('');
  });

  it('reads numbered headings with Ans paragraphs and question-only lists', () => {
    const a = splitInterview("<div class='x'><h3>Interview Questions</h3><h4>1. What is A?</h4><p>Ans: It is B.</p><ul><li>and C</li></ul><h4>2. Why?</h4></div>");
    expect(a.qa).toEqual([['What is A?', 'It is B. and C'], ['Why?', '']]);
    const b = splitInterview('<h4>Important Interview Questions</h4><ol><li>What is X?</li></ol>');
    expect(b.qa).toEqual([['What is X?', '']]);
    expect(b.rest).toBe('');
  });

  it('reads "Q: question - answer" list items', () => {
    const { qa, rest } = splitInterview('<h4>Interview Questions</h4><ul><li><strong>Q: Can a sealed class be abstract?</strong> — Yes</li></ul>');
    expect(qa).toEqual([['Can a sealed class be abstract?', 'Yes']]);
    expect(rest).toBe('');
  });
});

describe('Java notes', () => {
  const java = coursesData.find(c => c.id === 'java')!;
  const topics = java.subTopics.flatMap(m => m.topics);
  const notes = (t: (typeof topics)[number]) => [...(t.beginner ?? []), ...(t.intermediate ?? []), ...(t.expert ?? [])].map(b => b.content).join('\n');

  it('no longer show an Interview Questions section in the notes', () => {
    for (const t of topics) expect(notes(t), t.name).not.toMatch(/<h[23][^>]*>[^<]*Interview Questions/i);
  });

  it('move the questions to the topic so the right pane can show them', () => {
    const jump = topics.find(t => t.name === 'Jumping Statements in Java')!;
    expect(jump.interviewQA?.length).toBeGreaterThanOrEqual(6);
    expect(jump.interviewQA![0][0]).toMatch(/unreachable|Code placed/i);
    for (const t of topics) for (const [q] of t.interviewQA ?? []) expect(q.length, t.name).toBeGreaterThan(3);
  });
});
