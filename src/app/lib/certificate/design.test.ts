import { describe, it, expect } from 'vitest';
import { buildCertificate, qrRuns, needsRaster, toLatin, gradeFor, PAGE_W, PAGE_H, type CertificateInput, type Cmd, type Measure } from './design';

// A stand-in for real font metrics: width grows with text length and size, so the fitting and
// wrapping logic can be exercised without a PDF library.
const measure: Measure = (s, _font, _style, size, spacing) => s.length * size * 0.19 + spacing * Math.max(0, s.length - 1);

const base: CertificateInput = {
  studentName: 'Pankaj Bhande',
  moduleName: 'Java Basics',
  courseName: 'Java',
  score: 9,
  totalQuestions: 10,
  issuedAt: new Date(2026, 9, 17),
  certificateUid: 'JSL-ABCD-EFGH-JKMN',
  verifyUrl: 'https://javaschoollab.com/verify/JSL-ABCD-EFGH-JKMN',
};
const texts = (cmds: Cmd[]) => cmds.filter((c): c is Extract<Cmd, { k: 'text' }> => c.k === 'text');
const textBlob = (cmds: Cmd[]) => texts(cmds).map(t => t.s).join(' | ');

describe('certificate design', () => {
  it('says who completed what, with score and grade', () => {
    const t = textBlob(buildCertificate(base, measure));
    for (const part of ['CERTIFICATE', 'OF COMPLETION', 'Pankaj Bhande', 'Java Basics', 'Java', 'SCORE  9/10', '90%', 'DISTINCTION', '17 October 2026', 'JSL-ABCD-EFGH-JKMN']) {
      expect(t, part).toContain(part);
    }
  });

  it('draws a scannable QR code for the verification address', () => {
    const cmds = buildCertificate(base, measure);
    const modules = cmds.filter(c => c.k === 'rect' && c.crisp);
    expect(modules.length).toBeGreaterThan(100);
    // the QR sits inside the page, in the bottom-left, and stays about 22 mm square
    for (const m of modules) {
      if (m.k !== 'rect') continue;
      expect(m.x).toBeGreaterThanOrEqual(29);
      expect(m.x + m.w).toBeLessThanOrEqual(31 + 22 + 0.01);
      expect(m.y).toBeGreaterThanOrEqual(155.99);
    }
    expect(textBlob(cmds)).toContain('SCAN TO VERIFY');
    expect(textBlob(cmds)).toContain('javaschoollab.com/verify/JSL-ABCD-EFGH-JKMN');
  });

  it('QR runs follow the QR standard: a dark finder square at three corners', () => {
    const { n, runs } = qrRuns(base.verifyUrl!);
    const dark = (r: number, c: number) => runs.some(([row, col, len]) => row === r && c >= col && c < col + len);
    for (const [r0, c0] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
      for (let i = 0; i < 7; i++) {
        expect(dark(r0, c0 + i)).toBe(true);        // top edge of the finder
        expect(dark(r0 + 6, c0 + i)).toBe(true);    // bottom edge
        expect(dark(r0 + i, c0)).toBe(true);        // left edge
        expect(dark(r0 + i, c0 + 6)).toBe(true);    // right edge
      }
      expect(dark(r0 + 1, c0 + 1)).toBe(false);     // light ring inside the square
      expect(dark(r0 + 3, c0 + 3)).toBe(true);      // dark centre
    }
  });

  it('shows a placeholder, not a QR, until the certificate has been issued', () => {
    const cmds = buildCertificate({ ...base, verifyUrl: undefined, certificateUid: 'ISSUED ON DOWNLOAD' }, measure);
    expect(cmds.some(c => c.k === 'rect' && c.crisp)).toBe(false);
    expect(textBlob(cmds)).toContain('QR CODE');
    expect(textBlob(cmds)).not.toContain('VERIFY:');
  });

  it('keeps every line of text inside the frame, even for very long names and titles', () => {
    const long: CertificateInput = {
      ...base,
      studentName: 'Venkata Subrahmanyam Lakshminarasimha Raghavendra Rao Chandrasekharan',
      moduleName: 'Concurrent Collections and the Java Memory Model: Thread Safety in Depth for Production Systems',
      courseName: 'Java Memory & JVM Internals Masterclass for Backend Engineers',
    };
    for (const input of [base, long]) {
      for (const t of texts(buildCertificate(input, measure))) {
        const w = measure(t.s, t.font, t.style, t.size, t.spacing ?? 0, !!t.raster);
        expect(t.x, t.s).toBeGreaterThanOrEqual(12);
        expect(t.x + w, t.s).toBeLessThanOrEqual(PAGE_W - 12 + 0.01);
        expect(t.y, t.s).toBeGreaterThan(12);
        expect(t.y, t.s).toBeLessThan(PAGE_H - 12);
      }
    }
  });

  it('draws names the PDF fonts cannot (Devanagari) as images, and leaves Latin names as text', () => {
    expect(needsRaster('पंकज भांडे')).toBe(true);
    expect(needsRaster('José Müller')).toBe(false);
    const hindi = texts(buildCertificate({ ...base, studentName: 'पंकज भांडे' }, measure)).find(t => t.s === 'पंकज भांडे');
    expect(hindi?.raster).toBe(true);
    const latin = texts(buildCertificate(base, measure)).find(t => t.s === 'Pankaj Bhande');
    expect(latin?.raster).toBeUndefined();
  });

  it('turns smart punctuation in titles into plain characters the PDF fonts have', () => {
    expect(toLatin('Java’s “Streams” – Part 1…')).toBe('Java\'s "Streams" - Part 1...');
    expect(toLatin('Java ☕ Basics')).toBe('Java Basics');
  });

  it('grades by percentage', () => {
    expect([100, 90, 89, 80, 79, 70].map(gradeFor)).toEqual(['DISTINCTION', 'DISTINCTION', 'MERIT', 'MERIT', 'PASSED', 'PASSED']);
  });
});
