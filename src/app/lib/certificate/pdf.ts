// Draws the certificate command list (design.ts) into a PDF, and supplies the text measurer both
// the PDF and the on-screen preview use, so their layouts are identical. jsPDF is loaded on demand.

import type { jsPDF as JsPdf } from 'jspdf';
import { buildCertificate, needsRaster, PAGE_H, PAGE_W, type Cmd, type CertificateInput, type Font, type FontStyle, type Measure } from './design';

const PT_TO_MM = 25.4 / 72;

let measureDoc: Promise<JsPdf> | null = null;

async function newDoc(): Promise<JsPdf> {
  const { jsPDF } = await import('jspdf');
  return new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
}

function canvasFont(style: FontStyle, px: number): string {
  const italic = style === 'italic' || style === 'bolditalic' ? 'italic ' : '';
  const weight = style === 'bold' || style === 'bolditalic' ? '700 ' : '400 ';
  // Fallback fonts that cover Devanagari and other scripts the PDF's built-in fonts cannot draw
  return `${italic}${weight}${px}px "Times New Roman", "Noto Serif Devanagari", "Mangal", "Nirmala UI", serif`;
}

/** Width in mm of text drawn through the canvas (used only for names the PDF fonts cannot draw). */
function canvasWidthMm(s: string, style: FontStyle, sizePt: number): number {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return s.length * sizePt * PT_TO_MM * 0.55;
  const px = 100;
  ctx.font = canvasFont(style, px);
  return (ctx.measureText(s).width / px) * sizePt * PT_TO_MM;
}

/** A measurer backed by jsPDF's real font metrics. */
export function makeMeasure(doc: JsPdf): Measure {
  return (s, font, style, size, spacing, raster) => {
    if (raster) return canvasWidthMm(s, style, size);
    doc.setFont(font, style);
    doc.setFontSize(size);
    return doc.getTextWidth(s) + spacing * Math.max(0, s.length - 1);
  };
}

/** One shared measurer, so the preview does not build a PDF document per render. */
export function getMeasure(): Promise<Measure> {
  measureDoc ??= newDoc();
  return measureDoc.then(makeMeasure);
}

const hex = (c: string): [number, number, number] => {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

function rasterText(s: string, sizePt: number, style: FontStyle, color: string) {
  const scale = 4; // canvas pixels per CSS pixel: sharp when printed, without a huge PDF
  const px = sizePt * (96 / 72) * scale;
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = canvasFont(style, px);
  const pad = Math.ceil(px * 0.15);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(probe.measureText(s).width) + pad * 2;
  canvas.height = Math.ceil(px * 1.6);
  const ctx = canvas.getContext('2d')!;
  ctx.font = canvasFont(style, px);
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  const baseline = px * 1.15;
  ctx.fillText(s, pad, baseline);
  const mmPerPx = 25.4 / (96 * scale);
  return { dataUrl: canvas.toDataURL('image/png'), w: canvas.width * mmPerPx, h: canvas.height * mmPerPx, pad: pad * mmPerPx, baseline: baseline * mmPerPx };
}

export function drawCertificate(doc: JsPdf, cmds: Cmd[]): void {
  for (const c of cmds) {
    if (c.k === 'text') {
      if (c.raster) {
        const img = rasterText(c.s, c.size, c.style, c.color);
        doc.addImage(img.dataUrl, 'PNG', c.x - img.pad, c.y - img.baseline, img.w, img.h, undefined, 'MEDIUM');
        continue;
      }
      doc.setFont(c.font, c.style);
      doc.setFontSize(c.size);
      doc.setTextColor(...hex(c.color));
      doc.text(c.s, c.x, c.y, c.spacing ? { charSpace: c.spacing } : undefined);
      continue;
    }
    if (c.k === 'line') {
      doc.setDrawColor(...hex(c.stroke));
      doc.setLineWidth(c.lw);
      doc.line(c.x1, c.y1, c.x2, c.y2);
      continue;
    }
    const style = c.fill && c.stroke ? 'FD' : c.fill ? 'F' : 'S';
    if (c.fill) doc.setFillColor(...hex(c.fill));
    if (c.stroke) doc.setDrawColor(...hex(c.stroke));
    if (c.lw) doc.setLineWidth(c.lw);
    if (c.k === 'rect') {
      if (c.r) doc.roundedRect(c.x, c.y, c.w, c.h, c.r, c.r, style);
      else doc.rect(c.x, c.y, c.w, c.h, style);
    } else if (c.k === 'circle') {
      doc.circle(c.x, c.y, c.r, style);
    } else if (c.k === 'poly') {
      const [first, ...rest] = c.pts;
      const rel: [number, number][] = [];
      let px = first[0], py = first[1];
      for (const [x, y] of rest) { rel.push([x - px, y - py]); px = x; py = y; }
      doc.lines(rel, first[0], first[1], [1, 1], style, true);
    }
  }
}

/** Builds the certificate PDF document. */
export async function createCertificatePdf(input: CertificateInput): Promise<JsPdf> {
  const doc = await newDoc();
  const cmds = buildCertificate(input, makeMeasure(doc));
  drawCertificate(doc, cmds);
  doc.setProperties({
    title: `Certificate of Completion - ${input.moduleName}`,
    subject: `${input.studentName} completed ${input.moduleName} (${input.courseName})`,
    author: 'JavaSchoolLab',
    keywords: input.certificateUid,
    creator: 'JavaSchoolLab',
  });
  return doc;
}

export const certificateFileName = (input: Pick<CertificateInput, 'moduleName' | 'certificateUid'>) =>
  `JavaSchoolLab_Certificate_${input.moduleName.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'Module'}_${input.certificateUid}.pdf`;

export async function downloadCertificatePdf(input: CertificateInput): Promise<void> {
  const doc = await createCertificatePdf(input);
  doc.save(certificateFileName(input));
}

export { PAGE_W, PAGE_H, needsRaster };
