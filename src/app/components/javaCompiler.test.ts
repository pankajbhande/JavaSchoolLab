import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// "Try it" opens the stand-alone compiler page in a new tab. It used to point at a path under src/, which only exists in the Vite
// dev server: in a production build (Spring jar, nginx) the button opened nothing useful. The page now lives in public/, which is
// copied into every build, and this keeps the button and the file in step.
describe('Java compiler page', () => {
  const root = process.cwd();
  const contentArea = fs.readFileSync(path.join(root, 'src/app/components/ContentArea.tsx'), 'utf8');

  it('is served from public/, so production builds contain it', () => {
    expect(fs.existsSync(path.join(root, 'public/java-compiler.html'))).toBe(true);
  });

  it('is what the Try it button opens, not a path under src/', () => {
    expect(contentArea).toContain('window.open("/java-compiler.html"');
    expect(contentArea).not.toContain('/src/app/components/JavaCompiler.html');
  });

  it('reads the code the lesson handed over through localStorage on the same origin', () => {
    const html = fs.readFileSync(path.join(root, 'public/java-compiler.html'), 'utf8');
    expect(html).toContain('java_try_code');
    expect(contentArea).toContain('"java_try_code"');
  });
});
