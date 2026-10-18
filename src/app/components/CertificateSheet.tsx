import { useEffect, useMemo, useState } from 'react';
import { buildCertificate, PAGE_H, PAGE_W, type Cmd, type CertificateInput, type Font } from '../lib/certificate/design';
import { getMeasure } from '../lib/certificate/pdf';

const PT_TO_MM = 25.4 / 72;
const FAMILY: Record<Font, string> = {
  times: "'Times New Roman', Times, 'Liberation Serif', 'Noto Serif Devanagari', 'Nirmala UI', serif",
  helvetica: "Helvetica, Arial, 'Liberation Sans', sans-serif",
  courier: "'Courier New', Courier, 'Liberation Mono', monospace",
};

/** Builds the certificate drawing for `input` using the same text metrics as the PDF. */
export function useCertificateCommands(input: CertificateInput): Cmd[] | null {
  const [cmds, setCmds] = useState<Cmd[] | null>(null);
  const key = JSON.stringify([input.verifyUrl, input.studentName, input.moduleName, input.courseName, input.score, input.totalQuestions, input.issuedAt.getTime(), input.certificateUid]);
  useEffect(() => {
    let cancelled = false;
    getMeasure().then(measure => { if (!cancelled) setCmds(buildCertificate(input, measure)); }).catch(() => { if (!cancelled) setCmds(null); });
    return () => { cancelled = true; };
  }, [key]);
  return cmds;
}

/** The certificate as SVG: the on-screen twin of the PDF. */
export function CertificateSheet({ input, className }: { input: CertificateInput; className?: string }) {
  const cmds = useCertificateCommands(input);
  const label = `Certificate of completion for ${input.studentName}: ${input.moduleName}, ${input.courseName}, score ${input.score} of ${input.totalQuestions}`;

  const shapes = useMemo(() => (cmds ?? []).map((c, i) => {
    switch (c.k) {
      case 'rect':
        return <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx={c.r} fill={c.fill ?? 'none'} stroke={c.stroke} strokeWidth={c.lw} shapeRendering={c.crisp ? 'crispEdges' : undefined} />;
      case 'circle':
        return <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.fill ?? 'none'} stroke={c.stroke} strokeWidth={c.lw} />;
      case 'line':
        return <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke={c.stroke} strokeWidth={c.lw} />;
      case 'poly':
        return <polygon key={i} points={c.pts.map(p => p.join(',')).join(' ')} fill={c.fill ?? 'none'} stroke={c.stroke} strokeWidth={c.lw} strokeLinejoin="miter" />;
      case 'text':
        return (
          <text
            key={i}
            x={c.x}
            y={c.y}
            fill={c.color}
            fontFamily={FAMILY[c.font]}
            fontSize={c.size * PT_TO_MM}
            fontWeight={c.style === 'bold' || c.style === 'bolditalic' ? 700 : 400}
            fontStyle={c.style === 'italic' || c.style === 'bolditalic' ? 'italic' : 'normal'}
            letterSpacing={c.spacing}
            style={{ whiteSpace: 'pre' }}
          >
            {c.s}
          </text>
        );
    }
  }), [cmds]);

  return (
    <svg
      viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
      className={className}
      role="img"
      aria-label={label}
      style={{ display: 'block', width: '100%', height: 'auto', background: '#FFFBF2' }}
    >
      <title>{label}</title>
      {cmds ? shapes : <rect width={PAGE_W} height={PAGE_H} fill="#FFFBF2" />}
    </svg>
  );
}
