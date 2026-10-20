import { looksLikeHtml } from './htmlCode';

// Courses whose samples run in the in-browser Python runner.
const PYTHON_COURSES = new Set(['python', 'data-science', 'machine-learning']);

// Courses whose samples are not plain Java and have no online runner (they need a framework, a database or a device),
// so "Try it" would only open the Java compiler and fail. HTML samples still open the HTML viewer.
const NO_RUNNER_COURSES = new Set([
  'javafx', 'spring-core', 'spring-boot', 'spring-mvc', 'hibernate', 'microservices-fundamentals', 'jsp-servlet',
  'mysql', 'angular', 'flutter', 'react-js', 'javascript',
]);

// Imports and annotations that the online Java compiler (plain OpenJDK, no libraries) cannot resolve.
const LIBRARY_USE =
  /\bimport\s+(static\s+)?(javafx|org\.springframework|org\.hibernate|jakarta|javax\.(persistence|servlet|validation|inject)|org\.junit|org\.mockito|org\.testfx|lombok|com\.fasterxml|org\.apache|org\.slf4j|io\.(micrometer|github|reactivex)|reactor)\b|^\s*@(SpringBootApplication|Service|Component|Repository|RestController|Controller|Configuration|Autowired|Entity|Transactional|Bean|Test)\b/m;

/** Whether a code sample can be run from the "Try it" button: it must have an online runner that can actually run it. */
export function canTryOnline(code: string, courseId?: string): boolean {
  if (courseId && PYTHON_COURSES.has(courseId)) return true;
  if (looksLikeHtml(code)) return true;
  if (courseId && NO_RUNNER_COURSES.has(courseId)) return false;
  return !LIBRARY_USE.test(code);
}
