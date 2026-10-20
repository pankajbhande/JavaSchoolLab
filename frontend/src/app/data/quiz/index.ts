// Registry of authored assessment banks.
//
// Keys come in two shapes, checked most-specific first:
//   'courseId/moduleId'  a module bank (moduleId is a subTopic id from coursesData)
//   'courseId'           a course-wide bank, used when a module has no bank of its own
//
// Module ids are NOT unique across courses (both Java and JSP Servlets have a module
// called 'exception-handling'), which is why module keys are course-scoped.

import type { QuizBank } from './types';
import { javaBasics } from './banks/javaBasics';
import { javaOop } from './banks/javaOop';
import { javaExceptions } from './banks/javaExceptions';
import { javaConcurrency } from './banks/javaConcurrency';
import { collections } from './banks/collections';
import { servlets } from './banks/servlets';
import { jvm } from './banks/jvm';
import { designPatterns } from './banks/designPatterns';
import { javafx } from './banks/javafx';

// The JVM questions now sit inside the Java course: one copy of the bank per JVM module
const JVM_MODULES = ['jvm-architecture', 'object-memory', 'garbage-collection', 'jvm-performance', 'jvm-problems'];
const jvmBanks: QuizBank[] = JVM_MODULES.map(m => ({ ...jvm, key: `java/${m}` }));

const BANKS: QuizBank[] = [
  javaBasics,
  javaOop,
  javaExceptions,
  javaConcurrency,
  collections,
  servlets,
  ...jvmBanks,
  designPatterns,
  javafx,
];

const byKey = new Map<string, QuizBank>(BANKS.map(b => [b.key, b]));

if (import.meta.env?.DEV) {
  // Catch a duplicate key at startup rather than silently shadowing a bank.
  if (byKey.size !== BANKS.length) {
    const seen = new Set<string>();
    const dupes = BANKS.map(b => b.key).filter(k => (seen.has(k) ? true : (seen.add(k), false)));
    console.error('[quiz] duplicate bank keys:', dupes);
  }
  for (const b of BANKS) {
    for (const q of b.questions) {
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        console.error('[quiz] correctAnswer out of range', b.key, q.id);
      }
      if (new Set(q.options).size !== q.options.length) {
        console.error('[quiz] duplicate options', b.key, q.id);
      }
    }
  }
}

/** Most specific bank available for this module, else the course bank, else undefined. */
export function findBank(moduleId?: string, courseId?: string): QuizBank | undefined {
  if (courseId && moduleId) {
    const scoped = byKey.get(courseId + '/' + moduleId);
    if (scoped) return scoped;
  }
  return courseId ? byKey.get(courseId) : undefined;
}

/** True when a real assessment exists for this module — gates the certificate path. */
export function hasBank(moduleId?: string, courseId?: string): boolean {
  return !!findBank(moduleId, courseId);
}

export const allBanks = BANKS;
