// Every runnable Java sample in a lesson is shown inside a JavaSchoolLab package, the way a
// real project would lay it out: com.javaschoollab.<course>.<topic>. It is applied when the
// sample is displayed (not stored in the lesson data), so there is one rule for ~18 MB of
// content and the package always matches the topic the student is reading.

const RESERVED = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
  'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
  'volatile', 'while', 'true', 'false', 'null', '_',
]);

// Courses whose code samples are Java. Others (Angular, Flutter, JS, SQL, Python...) also have
// `class` and `;`, so they are excluded by course rather than guessed from the code.
const JAVA_COURSES = new Set([
  "java", "java-memory-jvm", "collection", "design-patterns", "algorithms", "jdbc", "jsp-servlet",
  "hibernate", "spring-mvc", "spring-boot", "microservices", "javafx", "programming-fundamentals",
  "software-foundations",
]);
export const isJavaCourse = (courseId: string) => JAVA_COURSES.has(courseId);

/** One valid, lower-case package segment from a course or topic id. */
export function packageSegment(id: string): string {
  let seg = id.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (!seg) seg = 'topic';
  if (/^[0-9]/.test(seg)) seg = 't' + seg;
  if (RESERVED.has(seg)) seg += '_';
  return seg;
}

export function packageName(courseId: string, topicId: string): string {
  return `com.javaschoollab.${packageSegment(courseId)}.${packageSegment(topicId)}`;
}

// Other languages that also contain `class` and `;` (JS, C#, C++, SQL, HTML...).
const NOT_JAVA =
  /(#include|\bdef\s+\w+\s*\(|\bfunction\s+\w+|console\.log|\bconst\s+\w+\s*=|\blet\s+\w+\s*=|\bvar\s+\w+\s*=|=>\s*[{(]|\busing\s+System|\bnamespace\s|\bSELECT\b[\s\S]*\bFROM\b|<\/?(?:div|span|html|body|head|script|style|p|ul|li|a|img)\b)/;

const TYPE_DECL = /^\s*(?:@\w+(?:\([^)]*\))?\s*)*(?:(?:public|protected|private|abstract|final|static|sealed|non-sealed|strictfp)\s+)*(?:class|interface|enum|record|@interface)\s+[A-Za-z_$][\w$]*/m;

/** True for a complete Java compilation unit (it declares a top-level type). */
export function isJavaProgram(code: string): boolean {
  if (/^\s*package\s+[\w.]+\s*;/m.test(code)) return false; // already has one
  if (NOT_JAVA.test(code)) return false;
  if (!code.includes(';') && !code.includes('{')) return false;
  return TYPE_DECL.test(code);
}

/**
 * Prepends `package com.javaschoollab.<course>.<topic>;` to a complete Java program, after any
 * leading comments (a file header such as `// Hello.java` stays on top). Anything else (SQL,
 * JavaScript, a statement fragment, code that already declares a package) is returned as is.
 */
export function withJavaPackage(code: string, courseId: string, topicId: string): string {
  if (!isJavaCourse(courseId) || !isJavaProgram(code)) return code;
  const pkg = `package ${packageName(courseId, topicId)};`;

  const lines = code.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  let inBlock = false;
  for (; i < lines.length; i++) {
    const t = lines[i].trim();
    if (inBlock) { if (t.includes('*/')) inBlock = false; continue; }
    if (t === '' || t.startsWith('//')) continue;
    if (t.startsWith('/*')) { if (!t.includes('*/')) inBlock = true; continue; }
    break;
  }
  const head = lines.slice(0, i);
  const rest = lines.slice(i);
  return [...head, pkg, '', ...rest].join('\n');
}

/** Removes a leading package declaration (used before sending code to the online compiler). */
export function stripPackage(code: string): string {
  return code.replace(/^\s*package\s+[\w.]+\s*;[ \t]*\r?\n?/m, '');
}
