// Pure helpers behind the smarter quiz results: concept labels, per-concept grouping,
// "study this" lesson links and the missed-question retake set. No React, no I/O.

import { slugify } from './slug';
import { reshuffleQuestions, type PreparedQuestion } from '../services/quizEngine';

/** Structural subset of the generated course index (kept local so tests need no 250KB import). */
export interface LessonIndexCourse {
  id: string;
  subTopics: { id: string; name: string; topics: { id: string; name: string }[] }[];
}

interface ConceptRule {
  label: string;
  /** Tested against "<question id> <question text>". First matching rule wins. */
  test: RegExp;
  /** Lesson-name phrases (lowercase) that confidently identify the matching lesson. */
  lessons: string[];
}

const RULES: ConceptRule[] = [
  { label: 'JVM & Memory', test: /\bjvm\b|jvm-|\bheap\b|\bmetaspace\b|permgen|garbage|\bjit\b|stackoverflow|outofmemory|memory area/i, lessons: ['garbage collection', 'jvm memory', 'jvm architecture', 'memory management'] },
  { label: 'Design Patterns', test: /singleton|factory|builder pattern|\bbuilder\b|adapter|decorator|strategy|observer|\bproxy\b|template method|^dp-/i, lessons: ['design pattern'] },
  { label: 'Servlets & JSP', test: /servlet|\bjsp\b|httpsession|requestdispatcher|sendredirect|\bfilter\b|^srv-/i, lessons: ['servlet'] },
  { label: 'Threads & Synchronization', test: /\bthread|volatile|synchroniz|deadlock|\bwait\(|\bsleep\(|^th-/i, lessons: ['multithreading in java', 'multithreading', 'thread'] },
  { label: 'Exception Handling', test: /exception|finally|\bcatch\b|try-with|\berror\b|^ex-/i, lessons: ['exception handling in java', 'exception handling'] },
  { label: 'final Keyword', test: /\bfinal\b/i, lessons: ['final keyword'] },
  { label: 'HashMap & Hashing', test: /hashmap|hashset|hashcode/i, lessons: ['hashmap', 'hashset'] },
  { label: 'Lists & Collections', test: /arraylist|linkedlist|\bvector\b|list\.of|comparator|comparable|collection|\bcol-/i, lessons: ['collection framework', 'collections', 'arraylist'] },
  { label: 'Constructors', test: /constructor|\bsuper\(|this\(\)/i, lessons: ['constructor in java', 'constructor'] },
  { label: 'Overriding & Overloading', test: /overrid|overload|covariant|oop-static|oop-private/i, lessons: ['polymorphism'] },
  { label: 'Interfaces & Abstraction', test: /abstract|interface/i, lessons: ['abstraction in java', 'interfaces in java'] },
  { label: 'Inheritance', test: /inherit|extends|more than one class/i, lessons: ['inheritance in java'] },
  { label: 'Encapsulation', test: /encapsulation/i, lessons: ['encapsulation in java'] },
  { label: 'Control Flow', test: /\bswitch\b/i, lessons: ['control statements'] },
  { label: 'Arrays', test: /\barray\b/i, lessons: ['array in java'] },
  { label: 'Strings', test: /\bstring\b|jb-string/i, lessons: ['string in java'] },
  { label: 'Wrappers & Autoboxing', test: /integer|boxed|wrapper/i, lessons: ['wrapper class'] },
  { label: 'Operators & Expressions', test: /x\+\+|increment|\d\s*\/\s*\d|char literal|promotion|jb-char|jb-integer-division|operator/i, lessons: ['operators in java'] },
  { label: 'static Keyword', test: /static initializer|static block|jb-static/i, lessons: ['static keyword'] },
  { label: 'Data Types & Variables', test: /local variable|primitive|jb-local/i, lessons: ['data types and variables'] },
  { label: 'Methods & Parameters', test: /signature|parameter|\bmethod\b/i, lessons: ['methods in java'] },
];

const RULE_BY_LABEL = new Map(RULES.map(r => [r.label, r]));

export interface ConceptSource {
  id: string;
  question: string;
  /** Optional hand-authored concept; wins over derivation. */
  topic?: string;
  concept?: string;
}

/** Concept label for a question: authored tag, else keyword derivation, else the fallback (bank label). */
export function deriveConcept(q: ConceptSource, fallback = 'General'): string {
  const authored = (q.topic || q.concept || '').trim();
  if (authored) return authored;
  const haystack = `${q.id} ${q.question}`;
  for (const rule of RULES) if (rule.test.test(haystack)) return rule.label;
  return fallback;
}

export interface ConceptStat {
  concept: string;
  correct: number;
  total: number;
  /** Indexes (into the quiz's question list) of the questions missed in this concept. */
  missed: number[];
}

/** Groups graded results by concept, weakest first (lowest ratio, then most missed, then name). */
export function groupByConcept(items: { concept: string; correct: boolean }[]): ConceptStat[] {
  const map = new Map<string, ConceptStat>();
  items.forEach((it, i) => {
    const s = map.get(it.concept) ?? { concept: it.concept, correct: 0, total: 0, missed: [] };
    s.total++;
    if (it.correct) s.correct++;
    else s.missed.push(i);
    map.set(it.concept, s);
  });
  return [...map.values()].sort((a, b) => {
    const ra = a.correct / a.total;
    const rb = b.correct / b.total;
    if (ra !== rb) return ra - rb;
    const ma = a.total - a.correct;
    const mb = b.total - b.correct;
    if (ma !== mb) return mb - ma;
    return a.concept.localeCompare(b.concept);
  });
}

export interface LessonLink {
  href: string;
  /** 'topic' = a specific lesson; 'module' = the start of the module (no confident lesson). */
  kind: 'topic' | 'module';
  label: string;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Where to send a student who is weak on `concept`. Only a lesson in the SAME course whose name
 * contains one of the concept's phrases counts as a confident match (current module preferred,
 * interview-Q&A pages skipped, shortest name wins). Otherwise the start of the module, otherwise
 * nothing - a wrong link is worse than no link.
 */
export function lessonLinkForConcept(
  concept: string,
  courseId: string | undefined,
  moduleId: string | undefined,
  courses: LessonIndexCourse[],
): LessonLink | null {
  const course = courseId ? courses.find(c => c.id === courseId) : undefined;
  if (!course) return null;
  const mod = course.subTopics.find(m => m.id === moduleId);
  const rule = RULE_BY_LABEL.get(concept);
  const base = `/course/${slugify(course.id)}`;

  if (rule) {
    const search = mod ? [mod, ...course.subTopics.filter(m => m !== mod)] : course.subTopics;
    for (const phrase of rule.lessons) {
      for (const m of search) {
        const hits = m.topics
          .filter(t => !/interview/i.test(t.name) && norm(t.name).includes(phrase))
          .sort((a, b) => a.name.length - b.name.length);
        if (hits[0]) {
          return { href: `${base}/${slugify(m.id)}/${slugify(hits[0].id)}`, kind: 'topic', label: hits[0].name };
        }
      }
    }
  }
  if (mod && mod.topics.length > 0) {
    return { href: `${base}/${slugify(mod.id)}/${slugify(mod.topics[0].id)}`, kind: 'module', label: mod.name };
  }
  return null;
}

/** Indexes of questions that were not answered correctly (unanswered = -1 counts as missed). */
export function missedIndexes(questions: { answerIndex: number }[], answers: number[]): number[] {
  const out: number[] = [];
  questions.forEach((q, i) => {
    if (answers[i] !== q.answerIndex) out.push(i);
  });
  return out;
}

/** The practice set: only the missed questions, options freshly shuffled and the answer remapped. */
export function buildRetakeSet(questions: PreparedQuestion[], answers: number[], seed: number): PreparedQuestion[] {
  const missed = missedIndexes(questions, answers).map(i => questions[i]);
  return reshuffleQuestions(missed, seed);
}

/** "2 min 05 s" / "42 s" for the results header. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m} min ${String(s).padStart(2, '0')} s` : `${s} s`;
}
