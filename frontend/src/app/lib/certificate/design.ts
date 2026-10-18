// The certificate, described once as a list of drawing commands in millimetres on an A4 landscape
// page (297 x 210). Two renderers draw the same list: CertificateSheet.tsx (SVG, the on-screen
// preview) and pdf.ts (jsPDF, the download), so what a student sees is exactly what they get.
//
// This file has no browser or PDF dependency: text is measured through the `Measure` it is given.

import qrcode from 'qrcode-generator';

export const PAGE_W = 297;
export const PAGE_H = 210;

export type Font = 'times' | 'helvetica' | 'courier';
export type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';

export type Cmd =
  | { k: 'rect'; x: number; y: number; w: number; h: number; fill?: string; stroke?: string; lw?: number; r?: number; /** QR modules: no anti-aliased seams between neighbours */ crisp?: boolean }
  | { k: 'circle'; x: number; y: number; r: number; fill?: string; stroke?: string; lw?: number }
  | { k: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; lw: number }
  | { k: 'poly'; pts: [number, number][]; fill?: string; stroke?: string; lw?: number }
  /** Left-aligned at x (callers centre text by measuring), baseline at y. `size` is in points. */
  | { k: 'text'; s: string; x: number; y: number; size: number; font: Font; style: FontStyle; color: string; spacing?: number; raster?: boolean };

/** Width in mm of `s` as the renderers will draw it, including letter spacing. */
export type Measure = (s: string, font: Font, style: FontStyle, size: number, spacing: number, raster: boolean) => number;

export interface CertificateInput {
  studentName: string;
  moduleName: string;
  courseName: string;
  score: number;
  totalQuestions: number;
  issuedAt: Date;
  certificateUid: string;
  /** Where the QR code points (the public verification page). Without it a placeholder is drawn instead. */
  verifyUrl?: string;
}

export const COLORS = {
  paper: '#FFFBF2',
  ring: '#F6E2C6',
  deep: '#7C2D12',
  orange: '#EA580C',
  gold: '#B7791F',
  goldLight: '#EBCB7A',
  ink: '#1F2937',
  muted: '#5B6472',
  chip: '#FEF1DC',
} as const;

const C = COLORS;
const CX = PAGE_W / 2;

/** Characters the PDF's built-in fonts can draw. Anything else (Devanagari names, say) is drawn as an image. */
const LATIN = /^[ -~ -ÿ]*$/;
export const needsRaster = (s: string) => !LATIN.test(s);

/** Smart punctuation and dashes become plain ASCII; other characters the PDF fonts lack are dropped. */
export function toLatin(s: string): string {
  return s
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^ -~ -ÿ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function gradeFor(percent: number): string {
  return percent >= 90 ? 'DISTINCTION' : percent >= 80 ? 'MERIT' : 'PASSED';
}

export function formatIssueDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Largest size from `start` down to `min` at which the text fits `maxW`. */
function fit(measure: Measure, s: string, font: Font, style: FontStyle, start: number, min: number, maxW: number, spacing = 0, raster = false): number {
  let size = start;
  while (size > min && measure(s, font, style, size, spacing, raster) > maxW) size -= 0.5;
  return size;
}

/** Greedy word wrap into at most `maxLines`; the last line ends in "..." if the text still does not fit. */
function wrap(measure: Measure, s: string, font: Font, style: FontStyle, size: number, maxW: number, maxLines: number): string[] {
  const words = s.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next, font, style, size, 0, false) <= maxW || !line) line = next;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1] + ' ' + lines.slice(maxLines).join(' ');
  while (last.length > 3 && measure(last + '...', font, style, size, 0, false) > maxW) last = last.slice(0, -1);
  kept[maxLines - 1] = last.trimEnd() + '...';
  return kept;
}

const starPoints = (cx: number, cy: number, outer: number, inner: number): [number, number][] =>
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });

const scallop = (cx: number, cy: number, outer: number, inner: number, teeth: number): [number, number][] =>
  Array.from({ length: teeth * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / teeth;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });

const diamond = (cx: number, cy: number, r: number): [number, number][] => [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];

/** Dark modules of a QR code as horizontal runs (fewer shapes, no gaps between neighbours). */
export function qrRuns(text: string): { n: number; runs: [row: number, col: number, len: number][] } {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const runs: [number, number, number][] = [];
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!qr.isDark(r, c)) { c++; continue; }
      const start = c;
      while (c < n && qr.isDark(r, c)) c++;
      runs.push([r, start, c - start]);
    }
  }
  return { n, runs };
}

export function buildCertificate(input: CertificateInput, measure: Measure): Cmd[] {
  const cmds: Cmd[] = [];
  const pct = input.totalQuestions > 0 ? Math.round((input.score / input.totalQuestions) * 100) : 0;
  const name = input.studentName.trim() || 'Guest';
  const moduleName = toLatin(input.moduleName) || 'Module';
  const courseName = toLatin(input.courseName) || 'Course';

  /** Pushes centred text and returns its width. */
  const centred = (s: string, y: number, size: number, font: Font, style: FontStyle, color: string, spacing = 0, raster = false, cx = CX) => {
    const w = measure(s, font, style, size, spacing, raster);
    cmds.push({ k: 'text', s, x: cx - w / 2, y, size, font, style, color, spacing: spacing || undefined, raster: raster || undefined });
    return w;
  };

  // ---- paper, watermark rings, frames
  cmds.push({ k: 'rect', x: 0, y: 0, w: PAGE_W, h: PAGE_H, fill: C.paper });
  [[74, 0.5], [66, 0.3], [58, 0.3], [34, 0.2]].forEach(([r, lw]) => cmds.push({ k: 'circle', x: CX, y: 108, r, stroke: C.ring, lw }));
  cmds.push({ k: 'rect', x: 7, y: 7, w: PAGE_W - 14, h: PAGE_H - 14, stroke: C.deep, lw: 1.6 });
  cmds.push({ k: 'rect', x: 10, y: 10, w: PAGE_W - 20, h: PAGE_H - 20, stroke: C.gold, lw: 0.6 });
  cmds.push({ k: 'rect', x: 12, y: 12, w: PAGE_W - 24, h: PAGE_H - 24, stroke: C.orange, lw: 0.25 });

  // ---- corner ornaments: nested triangles with a small bead
  for (const [x, y, sx, sy] of [[10, 10, 1, 1], [PAGE_W - 10, 10, -1, 1], [10, PAGE_H - 10, 1, -1], [PAGE_W - 10, PAGE_H - 10, -1, -1]] as const) {
    const tri = (leg: number, fill: string, off = 0) => cmds.push({ k: 'poly', fill, pts: [[x + sx * off, y + sy * off], [x + sx * (off + leg), y + sy * off], [x + sx * off, y + sy * (off + leg)]] });
    tri(23, C.deep);
    tri(18, C.gold);
    tri(15.5, C.paper);
    cmds.push({ k: 'circle', x: x + sx * 6, y: y + sy * 6, r: 1.7, fill: C.orange });
    cmds.push({ k: 'circle', x: x + sx * 6, y: y + sy * 6, r: 0.6, fill: C.paper });
  }

  // ---- brand line and title
  centred('JAVASCHOOLLAB', 30, 11, 'helvetica', 'bold', C.orange, 1.8);
  for (const sign of [-1, 1]) {
    const x1 = CX + sign * 30, x2 = CX + sign * 62;
    cmds.push({ k: 'line', x1, y1: 28.6, x2, y2: 28.6, stroke: C.gold, lw: 0.4 });
    cmds.push({ k: 'poly', fill: C.gold, pts: diamond(x2, 28.6, 1.1) });
  }
  const titleSize = fit(measure, 'CERTIFICATE', 'times', 'bold', 50, 34, 190, 2.2);
  centred('CERTIFICATE', 50, titleSize, 'times', 'bold', C.deep, 2.2);
  centred('OF COMPLETION', 60.5, 13, 'helvetica', 'bold', C.gold, 3.4);
  cmds.push({ k: 'line', x1: CX - 34, y1: 65.5, x2: CX - 4, y2: 65.5, stroke: C.gold, lw: 0.4 });
  cmds.push({ k: 'line', x1: CX + 4, y1: 65.5, x2: CX + 34, y2: 65.5, stroke: C.gold, lw: 0.4 });
  cmds.push({ k: 'poly', fill: C.orange, pts: diamond(CX, 65.5, 1.5) });

  // ---- recipient
  centred('This is to certify that', 77, 15, 'times', 'italic', C.muted);
  const raster = needsRaster(name);
  // Scripts like Devanagari are drawn from the system font, which looks larger and sits taller than Times
  const nameSize = fit(measure, name, 'times', 'bolditalic', raster ? 32 : 40, 18, 215, 0, raster);
  const nameW = centred(name, raster ? 94 : 92, nameSize, 'times', 'bolditalic', C.deep, 0, raster);
  const ruleHalf = Math.min(118, Math.max(48, nameW / 2 + 12));
  cmds.push({ k: 'line', x1: CX - ruleHalf, y1: 96.4, x2: CX + ruleHalf, y2: 96.4, stroke: C.gold, lw: 0.6 });
  cmds.push({ k: 'line', x1: CX - ruleHalf, y1: 97.6, x2: CX + ruleHalf, y2: 97.6, stroke: C.gold, lw: 0.2 });

  // ---- what was completed
  centred('has successfully completed the module', 106, 14, 'times', 'italic', C.muted);
  let y = 117.5;
  const oneLine = fit(measure, moduleName, 'helvetica', 'bold', 24, 15, 232);
  if (measure(moduleName, 'helvetica', 'bold', oneLine, 0, false) <= 232) {
    centred(moduleName, y, oneLine, 'helvetica', 'bold', C.ink);
  } else {
    const lines = wrap(measure, moduleName, 'helvetica', 'bold', 16, 232, 2);
    lines.forEach((line, i) => centred(line, y + i * 8, 16, 'helvetica', 'bold', C.ink));
    y += (lines.length - 1) * 8;
  }
  // "in the course  X" on one line, the course name highlighted
  y += 9.5;
  const lead = 'in the course  ';
  const courseSize = fit(measure, courseName, 'helvetica', 'bold', 13, 9, 170);
  const leadW = measure(lead, 'times', 'italic', 14, 0, false);
  const courseW = measure(courseName, 'helvetica', 'bold', courseSize, 0, false);
  const startX = CX - (leadW + courseW) / 2;
  cmds.push({ k: 'text', s: lead, x: startX, y, size: 14, font: 'times', style: 'italic', color: C.muted });
  cmds.push({ k: 'text', s: courseName, x: startX + leadW, y, size: courseSize, font: 'helvetica', style: 'bold', color: C.orange });

  // ---- result chip
  y += 6.5;
  const result = `SCORE  ${input.score}/${input.totalQuestions}   ·   ${pct}%   ·   ${gradeFor(pct)}`;
  const resultW = measure(result, 'helvetica', 'bold', 10.5, 0.5, false);
  const chipW = resultW + 16;
  cmds.push({ k: 'rect', x: CX - chipW / 2, y, w: chipW, h: 9.5, fill: C.chip, stroke: C.gold, lw: 0.4, r: 4.75 });
  cmds.push({ k: 'text', s: result, x: CX - resultW / 2, y: y + 6.3, size: 10.5, font: 'helvetica', style: 'bold', color: C.deep, spacing: 0.5 });

  // ---- footer: date | seal | signature
  const baseY = 177;
  const date = formatIssueDate(input.issuedAt);
  centred(date, baseY - 2.5, 14, 'times', 'bold', C.ink, 0, false, 84);
  cmds.push({ k: 'line', x1: 64, y1: baseY, x2: 104, y2: baseY, stroke: C.muted, lw: 0.3 });
  centred('DATE OF ISSUE', baseY + 4.6, 7.5, 'helvetica', 'bold', C.muted, 0.8, false, 84);

  centred('JavaSchoolLab', baseY - 3, 22, 'times', 'bolditalic', C.deep, 0, false, 235);
  cmds.push({ k: 'line', x1: 205, y1: baseY, x2: 265, y2: baseY, stroke: C.muted, lw: 0.3 });
  centred('AUTHORIZED SIGNATORY', baseY + 4.6, 7.5, 'helvetica', 'bold', C.muted, 0.8, false, 235);
  centred('DHIPAN Software Technologies Private Limited', baseY + 8.6, 6.5, 'helvetica', 'normal', C.muted, 0, false, 235);

  // seal with ribbon tails (tails first so the seal sits on top)
  const sx = CX, sy = 164;
  for (const sign of [-1, 1]) {
    cmds.push({ k: 'poly', fill: C.deep, pts: [[sx + sign * 10, sy + 9], [sx + sign * 3, sy + 12], [sx + sign * 7.5, sy + 28], [sx + sign * 9.5, sy + 24.5], [sx + sign * 14, sy + 26]] });
  }
  cmds.push({ k: 'poly', fill: C.gold, pts: scallop(sx, sy, 16, 14.6, 30) });
  cmds.push({ k: 'circle', x: sx, y: sy, r: 12.8, fill: C.deep });
  cmds.push({ k: 'circle', x: sx, y: sy, r: 11.4, stroke: C.goldLight, lw: 0.4 });
  cmds.push({ k: 'poly', fill: C.goldLight, pts: starPoints(sx, sy - 2.9, 5.6, 2.35) });
  centred('CERTIFIED', sy + 6.9, 5.4, 'helvetica', 'bold', C.goldLight, 0.7, false, sx);

  // ---- QR code: scanning it opens the verification page for this certificate
  const qx = 31, qy = 156, qs = 22;
  cmds.push({ k: 'rect', x: qx - 2.2, y: qy - 2.2, w: qs + 4.4, h: qs + 4.4, fill: '#FFFFFF', stroke: C.gold, lw: 0.4, r: 1 });
  if (input.verifyUrl) {
    const { n, runs } = qrRuns(input.verifyUrl);
    const m = qs / n;
    for (const [row, col, len] of runs) {
      cmds.push({ k: 'rect', x: qx + col * m, y: qy + row * m, w: len * m, h: m, fill: '#111827', crisp: true });
    }
  } else {
    centred('QR CODE', qy + qs / 2 - 1, 6, 'helvetica', 'bold', C.muted, 0.6, false, qx + qs / 2);
    centred('ISSUED ON', qy + qs / 2 + 3, 5, 'helvetica', 'normal', C.muted, 0.4, false, qx + qs / 2);
    centred('DOWNLOAD', qy + qs / 2 + 6, 5, 'helvetica', 'normal', C.muted, 0.4, false, qx + qs / 2);
  }
  centred('SCAN TO VERIFY', qy + qs + 6.2, 6, 'helvetica', 'bold', C.muted, 0.7, false, qx + qs / 2);

  // ---- certificate id (and the address the QR code opens, for anyone who cannot scan it)
  const shortUrl = input.verifyUrl ? input.verifyUrl.replace(/^https?:\/\//, '') : '';
  const idLine = shortUrl ? `CERTIFICATE ID  ${input.certificateUid}    VERIFY: ${shortUrl}` : `CERTIFICATE ID  ${input.certificateUid}`;
  const idSize = fit(measure, idLine, 'courier', 'bold', 7, 4.5, 215, 0.3);
  centred(idLine, 195, idSize, 'courier', 'bold', C.muted, 0.3);

  return cmds;
}
