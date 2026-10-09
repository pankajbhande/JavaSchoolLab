import { motion } from 'motion/react';

type VisualKind =
  | 'inheritance'
  | 'encapsulation'
  | 'polymorphism'
  | 'abstraction'
  | 'access'
  | 'exception'
  | 'collection'
  | 'introduction'
  | 'jvm'
  | 'datatype'
  | 'operator'
  | 'control'
  | 'loop'
  | 'jump'
  | 'package'
  | 'string'
  | 'constructor'
  | 'static'
  | 'iostream'
  | 'serialization'
  | 'final'
  | 'wrapper'
  | 'thisSuper'
  | 'thread'
  | 'sync'
  | 'lambda'
  | 'record'
  | 'jdbc'
  | 'spring'
  | 'web'
  | 'database'
  | 'html'
  | 'pattern'
  | 'certificate'
  | 'properties'
  | 'classObject'
  | 'interview'
  | 'ifaceDefault'
  | 'files'
  | 'textBlock'
  | 'enum'
  | 'generics'
  | 'annotation'
  | 'reflection'
  | 'equalsHashcode'
  | 'comparator'
  | 'cloning'
  | 'varargs'
  | 'method'
  | 'linkedList'
  | 'stackDs'
  | 'queueDs'
  | 'hashingDs'
  | 'sortingDs'
  | 'searchingDs'
  | 'treeDs'
  | 'heapDs'
  | 'trieDs'
  | 'graphDs'
  | 'recursionDs'
  | 'greedyDs'
  | 'dpDs'
  | 'divideConquerDs'
  | 'bitDs'
  | 'segmentTreeDs'
  | 'geometryDs'
  | 'twoPointerDs'
  | 'complexityDs'
  | 'default';

// DSA module ids are prefixed exactly by their module slug (see dsaModules.ts), so a topic
// there is matched by id-prefix rather than fuzzy keyword search - far more reliable than
// the name-based rules below, and immune to a topic name that happens to share a word with
// an unrelated Java OOP concept (e.g. "Static" the keyword vs "Prefix Sum").
const DSA_PREFIX_KIND: [string, VisualKind][] = [
  ['dsa-foundations', 'complexityDs'],
  ['dsa-arrays', 'collection'],
  ['dsa-strings', 'string'],
  ['dsa-linked-list', 'linkedList'],
  ['dsa-stack', 'stackDs'],
  ['dsa-queue-deque', 'queueDs'],
  ['dsa-hashing', 'hashingDs'],
  ['dsa-sorting', 'sortingDs'],
  ['dsa-searching', 'searchingDs'],
  ['dsa-trees', 'treeDs'],
  ['dsa-heap', 'heapDs'],
  ['dsa-trie', 'trieDs'],
  ['dsa-graphs', 'graphDs'],
  ['dsa-recursion-backtracking', 'recursionDs'],
  ['dsa-greedy', 'greedyDs'],
  ['dsa-dynamic-programming', 'dpDs'],
  ['dsa-divide-conquer', 'divideConquerDs'],
  ['dsa-bit-manipulation', 'bitDs'],
  ['dsa-advanced-data-structures', 'segmentTreeDs'],
  ['dsa-advanced-algorithms', 'graphDs'],
  ['dsa-computational-geometry', 'geometryDs'],
  ['dsa-range-query', 'segmentTreeDs'],
  ['dsa-patterns', 'twoPointerDs'],
];

function detectKind(id: string, name: string): VisualKind {
  for (const [prefix, kind] of DSA_PREFIX_KIND) {
    if (id.startsWith(prefix)) return kind;
  }

  const s = `${id} ${name}`.toLowerCase();

  if (s.includes('inherit')) return 'inheritance';
  if (s.includes('encapsulat')) return 'encapsulation';
  if (s.includes('polymorph') || s.includes('overload') || s.includes('overrid')) return 'polymorphism';
  if (s.includes('abstract') || s.includes('interface')) return 'abstraction';
  if (s.includes('access specifier') || s.includes('access modifier')) return 'access';
  if (s.includes('exception') || s.includes('error') || s.includes('throw') || s.includes('catch')) return 'exception';
  if (s.includes('classes and objects') || s.includes('classes & objects') || s.includes('object class')) return 'classObject';
  if (s.includes('collection') || s.includes('array') || s.includes('list') || s.includes('set interface') || s.includes('map interface')) return 'collection';

  if (s.includes('introduction') || s.includes('feature') || s.includes('overview') || s.includes('basics') || s.includes('getting started') || s.includes('installation')) return 'introduction';
  if (s.includes('jvm') || s.includes('jdk') || s.includes('jre')) return 'jvm';
  if (s.includes('data type') || s.includes('variable') || s.includes('wrapper')) return s.includes('wrapper') ? 'wrapper' : 'datatype';
  if (s.includes('operator')) return 'operator';
  if (s.includes('control statement') || s.includes('switch') || s.includes('if') || s.includes('pattern matching')) return 'control';
  if (s.includes('loop') || s.includes('while') || s.includes('for each') || s.includes('foreach')) return 'loop';
  if (s.includes('jump') || s.includes('break') || s.includes('continue') || s.includes('return')) return 'jump';
  if (s.includes('package')) return 'package';
  if (s.includes('properties file') || s.includes('properties')) return 'properties';
  if (s.includes('text block')) return 'textBlock';
  if (s.includes('files utility') || s.includes('files-11') || (s.includes('files') && s.includes('utility'))) return 'files';
  if (s.includes('default method')) return 'ifaceDefault';
  if (s.includes('nested') || s.includes('inner class')) return 'classObject';
  if (s.includes('try-with-resources') || s.includes('try with resources') || s.includes('autocloseable')) return 'iostream';
  if (s.includes('scanner')) return 'iostream';
  if (s.includes('initializer block')) return 'constructor';
  if (s.includes('enum')) return 'enum';
  if (s.includes('generic')) return 'generics';
  if (s.includes('annotation')) return 'annotation';
  if (s.includes('reflection')) return 'reflection';
  if (s.includes('hashcode') || s.includes('equals()')) return 'equalsHashcode';
  if (s.includes('comparable') || s.includes('comparator')) return 'comparator';
  if (s.includes('cloning') || s.includes('cloneable')) return 'cloning';
  if (s.includes('varargs')) return 'varargs';
  if (s.includes('method')) return 'method';
  if (s.includes('string')) return 'string';
  if (s.includes('constructor')) return 'constructor';
  if (s.includes('static')) return 'static';
  if (s.includes('stream') && (s.includes('input') || s.includes('output') || s.includes('io'))) return 'iostream';
  if (s.includes('serializ')) return 'serialization';
  if (s.includes('final keyword') || s.includes('immutable')) return 'final';
  if (s.includes('this and super') || s.includes('this') || s.includes('super')) return 'thisSuper';
  if (s.includes('thread') || s.includes('multitask') || s.includes('multithread') || s.includes('virtual thread') || s.includes('executor') || s.includes('completablefuture') || s.includes('completable future')) return 'thread';
  if (s.includes('synchroniz') || s.includes('lock')) return 'sync';
  if (s.includes('lambda') || s.includes('stream') || s.includes('functional') || s.includes('optional') || s.includes('method reference')) return 'lambda';
  if (s.includes('record') || s.includes('sealed')) return 'record';
  if (s.includes('jdbc')) return 'jdbc';
  if (s.includes('spring')) return 'spring';
  if (s.includes('servlet') || s.includes('jsp') || s.includes('session') || s.includes('request') || s.includes('form handling') || s.includes('http client') || s.includes('http-client')) return 'web';
  if (s.includes('mysql') || s.includes('sql') || s.includes('database') || s.includes('table') || s.includes('join') || s.includes('key')) return 'database';
  if (s.includes('html') || s.includes('css')) return 'html';
  if (s.includes('design pattern') || s.includes('singleton') || s.includes('factory') || s.includes('creational')) return 'pattern';
  if (s.includes('certificate') || s.includes('hibernate') || s.includes('react')) return 'certificate';
  if (s.includes('interview')) return 'interview';
  if (s.includes('java8') || s.includes('java 8') || s.includes('java11') || s.includes('java 11')) return 'lambda';

  return 'default';
}

function InheritanceSvg() {
  return (
    <>
      <motion.rect
        x="30" y="14" width="40" height="18" rx="4"
        fill="#ea580c"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <text x="50" y="26" textAnchor="middle" fontSize="8" fill="#fff">Parent</text>

      <motion.line
        x1="50" y1="32" x2="50" y2="66"
        stroke="#f59e0b" strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, repeat: Infinity, repeatType: 'loop' }}
      />
      <motion.polygon
        points="45,60 55,60 50,68"
        fill="#f59e0b"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />

      <motion.rect
        x="26" y="70" width="48" height="18" rx="4"
        fill="#16a34a"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      />
      <text x="50" y="82" textAnchor="middle" fontSize="8" fill="#fff">Child</text>
    </>
  );
}

function EncapsulationSvg() {
  return (
    <>
      <rect x="20" y="30" width="60" height="45" rx="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
      <motion.circle
        cx="50" cy="40" r="4"
        fill="#ea580c"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#9a3412">private</text>
      <motion.g
        animate={{ rotate: [0, -8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ originX: '50px', originY: '18px' }}
      >
        <rect x="40" y="12" width="20" height="14" rx="3" fill="none" stroke="#16a34a" strokeWidth="2.5" />
        <rect x="36" y="22" width="28" height="18" rx="3" fill="#16a34a" />
      </motion.g>
    </>
  );
}

function PolymorphismSvg() {
  const shapes = [
    { cx: 30, cy: 78, delay: 0 },
    { cx: 50, cy: 78, delay: 0.3 },
    { cx: 70, cy: 78, delay: 0.6 },
  ];
  return (
    <>
      <circle cx="50" cy="22" r="9" fill="#3b82f6" />
      <text x="50" y="25" textAnchor="middle" fontSize="7" fill="#fff">fn()</text>
      {shapes.map((s, i) => (
        <motion.line
          key={i}
          x1="50" y1="30" x2={s.cx} y2={s.cy - 10}
          stroke="#93c5fd" strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.6, delay: s.delay }}
        />
      ))}
      <motion.rect x="22" y="72" width="16" height="16" fill="#ea580c" animate={{ y: [72, 68, 72] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0 }} />
      <motion.circle cx="50" cy="80" r="8" fill="#16a34a" animate={{ cy: [80, 76, 80] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }} />
      <motion.polygon points="70,70 78,86 62,86" fill="#a855f7" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.6 }} />
    </>
  );
}

function AbstractionSvg() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <motion.rect
          key={i}
          x={22 + i * 4} y={18 + i * 4} width="56" height="40" rx="6"
          fill="none"
          stroke={['#93c5fd', '#60a5fa', '#2563eb'][i]}
          strokeDasharray="6 4"
          strokeWidth="2"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
      <motion.circle
        cx="50" cy="38" r="7"
        fill="#2563eb"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      <text x="50" y="72" textAnchor="middle" fontSize="7" fill="#1d4ed8">blueprint</text>
    </>
  );
}

function AccessSvg() {
  const levels = [
    { label: 'private', color: '#dc2626', y: 20 },
    { label: 'default', color: '#f59e0b', y: 38 },
    { label: 'protected', color: '#2563eb', y: 56 },
    { label: 'public', color: '#16a34a', y: 74 },
  ];
  return (
    <>
      {levels.map((l, i) => (
        <motion.g key={l.label} animate={{ x: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}>
          <rect x="16" y={l.y - 7} width="14" height="14" rx="3" fill={l.color} />
          <rect x="34" y={l.y - 5} width="50" height="10" rx="3" fill={l.color} opacity="0.25" />
        </motion.g>
      ))}
    </>
  );
}

function ExceptionSvg() {
  return (
    <>
      <motion.g
        animate={{ y: [0, 28, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeIn' }}
      >
        <polygon points="50,14 62,34 38,34" fill="#dc2626" />
        <text x="50" y="31" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">!</text>
      </motion.g>
      <path d="M20,78 Q50,64 80,78 L80,86 Q50,74 20,86 Z" fill="#16a34a" />
      <text x="50" y="96" textAnchor="middle" fontSize="7" fill="#15803d">catch</text>
    </>
  );
}

function CollectionSvg() {
  return (
    <>
      {[0, 1, 2, 3].map(i => (
        <motion.rect
          key={i}
          x={18 + i * 16} y="35" width="12" height="24" rx="2"
          fill="#ea580c"
          animate={{ height: [24, 34, 24], y: [35, 30, 35] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      <text x="50" y="80" textAnchor="middle" fontSize="7" fill="#9a3412">[0] [1] [2] [3]</text>
    </>
  );
}

// Rising sun over a horizon — "getting started" / introduction / overview feel
function IntroductionSvg() {
  return (
    <>
      <motion.circle
        cx="50" cy="55" r="16"
        fill="#f59e0b"
        animate={{ cy: [60, 46, 60] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.line
          key={i}
          x1="50" y1="55"
          x2={50 + 26 * Math.cos((i * 60 * Math.PI) / 180)}
          y2={55 + 26 * Math.sin((i * 60 * Math.PI) / 180)}
          stroke="#fbbf24" strokeWidth="2"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      <rect x="14" y="72" width="72" height="4" rx="2" fill="#9a3412" opacity="0.3" />
    </>
  );
}

// Stacked layers — JVM / JDK / JRE containment
function JvmSvg() {
  const layers = [
    { y: 18, w: 64, label: 'JDK', color: '#ea580c' },
    { y: 38, w: 50, label: 'JRE', color: '#f59e0b' },
    { y: 58, w: 36, label: 'JVM', color: '#fbbf24' },
  ];
  return (
    <>
      {layers.map((l, i) => (
        <motion.g key={l.label} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
          <rect x={50 - l.w / 2} y={l.y} width={l.w} height="16" rx="4" fill={l.color} />
          <text x="50" y={l.y + 11} textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">{l.label}</text>
        </motion.g>
      ))}
    </>
  );
}

// Labeled boxes holding values — variables / data types
function DataTypeSvg() {
  const boxes = [
    { x: 16, label: 'int', val: '10', color: '#3b82f6' },
    { x: 40, label: 'bool', val: 'T', color: '#16a34a' },
    { x: 64, label: 'char', val: 'A', color: '#a855f7' },
  ];
  return (
    <>
      {boxes.map((b, i) => (
        <motion.g key={b.label} animate={{ y: [0, -3, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}>
          <rect x={b.x} y="30" width="18" height="24" rx="3" fill={b.color} />
          <text x={b.x + 9} y="45" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">{b.val}</text>
          <text x={b.x + 9} y="64" textAnchor="middle" fontSize="6" fill="#78716c">{b.label}</text>
        </motion.g>
      ))}
    </>
  );
}

// Plus/minus/multiply symbols orbiting a center
function OperatorSvg() {
  const ops = ['+', '-', '*', '/'];
  return (
    <>
      <circle cx="50" cy="50" r="6" fill="#ea580c" />
      {ops.map((op, i) => {
        const angle = (i * 90 * Math.PI) / 180;
        return (
          <motion.text
            key={op}
            fontSize="16" fontWeight="bold" fill="#f59e0b" textAnchor="middle"
            animate={{
              x: [50 + 26 * Math.cos(angle), 50 + 22 * Math.cos(angle), 50 + 26 * Math.cos(angle)],
              y: [54 + 26 * Math.sin(angle), 54 + 22 * Math.sin(angle), 54 + 26 * Math.sin(angle)],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          >
            {op}
          </motion.text>
        );
      })}
    </>
  );
}

// Fork in a path — if/else/switch decision flow
function ControlSvg() {
  return (
    <>
      <motion.circle cx="50" cy="18" r="6" fill="#3b82f6" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
      <line x1="50" y1="24" x2="50" y2="36" stroke="#94a3b8" strokeWidth="2" />
      <polygon points="50,34 60,44 40,44" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <line x1="42" y1="46" x2="26" y2="62" stroke="#16a34a" strokeWidth="2" />
      <line x1="58" y1="46" x2="74" y2="62" stroke="#dc2626" strokeWidth="2" />
      <motion.circle cx="26" cy="68" r="6" fill="#16a34a" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.3 }} />
      <motion.circle cx="74" cy="68" r="6" fill="#dc2626" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.9 }} />
      <text x="26" y="82" textAnchor="middle" fontSize="6" fill="#15803d">true</text>
      <text x="74" y="82" textAnchor="middle" fontSize="6" fill="#b91c1c">false</text>
    </>
  );
}

// Circular arrow — loops
function LoopSvg() {
  return (
    <>
      <motion.path
        d="M 50 20 A 30 30 0 1 1 22 62"
        fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round"
        animate={{ pathLength: [0, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
      />
      <motion.polygon
        points="16,56 28,56 22,68"
        fill="#ea580c"
        animate={{ rotate: [0, 360] }}
        style={{ originX: '22px', originY: '62px' }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
      />
      <text x="50" y="54" textAnchor="middle" fontSize="8" fill="#9a3412" fontWeight="bold">for</text>
    </>
  );
}

// Arrow breaking out of a box — break/continue/return
function JumpSvg() {
  return (
    <>
      <rect x="18" y="30" width="44" height="34" rx="4" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
      <motion.g animate={{ x: [0, 22, 0], opacity: [1, 1, 0, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
        <line x1="30" y1="47" x2="55" y2="47" stroke="#ea580c" strokeWidth="3" />
        <polygon points="55,41 68,47 55,53" fill="#ea580c" />
      </motion.g>
      <text x="40" y="20" textAnchor="middle" fontSize="7" fill="#78716c">loop</text>
    </>
  );
}

// Folder icon opening — packages
function PackageSvg() {
  return (
    <>
      <motion.g animate={{ rotate: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ originX: '50px', originY: '55px' }}>
        <path d="M20,40 L40,40 L46,48 L80,48 L80,72 L20,72 Z" fill="#f59e0b" />
        <path d="M20,40 L80,40 L80,46 L20,46 Z" fill="#ea580c" opacity="0.6" />
      </motion.g>
      {[0, 1, 2].map(i => (
        <motion.rect
          key={i} x={32 + i * 14} y="52" width="8" height="10" rx="1" fill="#fff" opacity="0.85"
          animate={{ y: [52, 48, 52] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </>
  );
}

// Quote marks with characters marching — Strings
function StringSvg() {
  const chars = ['J', 'a', 'v', 'a'];
  return (
    <>
      <text x="14" y="55" fontSize="20" fill="#ea580c" fontFamily="Georgia, serif">"</text>
      <text x="80" y="55" fontSize="20" fill="#ea580c" fontFamily="Georgia, serif">"</text>
      {chars.map((c, i) => (
        <motion.text
          key={i}
          x={32 + i * 12} y="52" fontSize="14" fontWeight="bold" fill="#3b82f6" textAnchor="middle"
          animate={{ y: [56, 48, 56] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        >
          {c}
        </motion.text>
      ))}
    </>
  );
}

// Hammer building a box — constructors
function ConstructorSvg() {
  return (
    <>
      <rect x="30" y="46" width="40" height="28" rx="3" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
      <motion.g
        animate={{ rotate: [-25, 5, -25] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{ originX: '38px', originY: '32px' }}
      >
        <rect x="34" y="14" width="8" height="26" rx="2" fill="#78716c" />
        <rect x="26" y="10" width="24" height="12" rx="3" fill="#ea580c" />
      </motion.g>
      <motion.rect x="34" y="52" width="14" height="14" fill="#16a34a" animate={{ opacity: [0, 1, 1] }} transition={{ duration: 1, repeat: Infinity }} />
    </>
  );
}

// Pin anchoring a shared box — static keyword
function StaticSvg() {
  return (
    <>
      <rect x="30" y="40" width="40" height="26" rx="4" fill="#3b82f6" />
      <text x="50" y="57" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">static</text>
      <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
        <circle cx="50" cy="22" r="5" fill="#ea580c" />
        <line x1="50" y1="27" x2="50" y2="40" stroke="#ea580c" strokeWidth="2" />
      </motion.g>
      {[20, 80].map((x, i) => (
        <motion.circle key={i} cx={x} cy="66" r="4" fill="#94a3b8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }} />
      ))}
    </>
  );
}

// Arrows flowing between two boxes — I/O streams
function IoStreamSvg() {
  return (
    <>
      <rect x="12" y="38" width="24" height="24" rx="3" fill="#3b82f6" />
      <text x="24" y="53" textAnchor="middle" fontSize="6" fill="#fff">IN</text>
      <rect x="64" y="38" width="24" height="24" rx="3" fill="#16a34a" />
      <text x="76" y="53" textAnchor="middle" fontSize="6" fill="#fff">OUT</text>
      <motion.circle
        r="3" fill="#f59e0b"
        animate={{ cx: [38, 62], cy: [50, 50] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    </>
  );
}

// Object breaking into bytes — serialization
function SerializationSvg() {
  return (
    <>
      <rect x="14" y="38" width="26" height="24" rx="3" fill="#3b82f6" />
      <text x="27" y="53" textAnchor="middle" fontSize="6" fill="#fff">Obj</text>
      {[0, 1, 2, 3, 4].map(i => (
        <motion.rect
          key={i} x={50 + i * 7} y="46" width="5" height="8" fill="#f59e0b"
          animate={{ opacity: [0, 1, 0], x: [44, 50 + i * 7, 86] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </>
  );
}

// Padlock — final keyword
function FinalSvg() {
  return (
    <>
      <motion.g animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ originX: '50px', originY: '50px' }}>
        <rect x="34" y="46" width="32" height="26" rx="4" fill="#dc2626" />
        <path d="M40,46 L40,36 A10,10 0 0 1 60,36 L60,46" fill="none" stroke="#dc2626" strokeWidth="4" />
        <circle cx="50" cy="58" r="4" fill="#fff" />
      </motion.g>
    </>
  );
}

// Box wrapping a primitive value — wrapper classes / autoboxing
function WrapperSvg() {
  return (
    <>
      <motion.text x="50" y="40" fontSize="16" fontWeight="bold" fill="#3b82f6" textAnchor="middle"
        animate={{ opacity: [1, 0, 0, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        5
      </motion.text>
      <motion.g animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <rect x="32" y="44" width="36" height="24" rx="4" fill="none" stroke="#ea580c" strokeWidth="2.5" />
        <text x="50" y="60" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ea580c">5</text>
      </motion.g>
      <text x="50" y="82" textAnchor="middle" fontSize="6" fill="#78716c">Integer</text>
    </>
  );
}

// Arrow pointing to self vs upward to parent — this/super
function ThisSuperSvg() {
  return (
    <>
      <rect x="30" y="14" width="40" height="16" rx="4" fill="#16a34a" opacity="0.85" />
      <text x="50" y="25" textAnchor="middle" fontSize="7" fill="#fff">super</text>
      <rect x="26" y="60" width="48" height="16" rx="4" fill="#ea580c" />
      <text x="50" y="71" textAnchor="middle" fontSize="7" fill="#fff">this</text>
      <motion.line x1="50" y1="60" x2="50" y2="32" stroke="#16a34a" strokeWidth="2"
        animate={{ pathLength: [0, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
      <motion.polygon points="45,36 55,36 50,28" fill="#16a34a" animate={{ y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />
      <motion.circle cx="50" cy="47" r="3" fill="#ea580c" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1, repeat: Infinity }} />
    </>
  );
}

// Multiple parallel lanes — threads/multitasking
function ThreadSvg() {
  return (
    <>
      {[26, 50, 74].map((y, i) => (
        <g key={i}>
          <line x1="14" y1={y} x2="86" y2={y} stroke="#e5e7eb" strokeWidth="2" />
          <motion.circle
            cy={y} r="5" fill={['#ea580c', '#3b82f6', '#16a34a'][i]}
            animate={{ cx: [14, 86, 14] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
        </g>
      ))}
    </>
  );
}

// Two lanes merging through a lock gate — synchronization
function SyncSvg() {
  return (
    <>
      <line x1="14" y1="34" x2="42" y2="34" stroke="#e5e7eb" strokeWidth="2" />
      <line x1="14" y1="66" x2="42" y2="66" stroke="#e5e7eb" strokeWidth="2" />
      <rect x="42" y="40" width="16" height="20" rx="3" fill="#dc2626" />
      <path d="M46,40 L46,34 A4,4 0 0 1 54,34 L54,40" fill="none" stroke="#dc2626" strokeWidth="2.5" />
      <line x1="58" y1="50" x2="86" y2="50" stroke="#e5e7eb" strokeWidth="2" />
      <motion.circle cy="34" r="4" fill="#3b82f6" animate={{ cx: [14, 40, 40, 40], opacity: [1, 1, 0, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.circle cy="66" r="4" fill="#16a34a" animate={{ cx: [14, 40, 40, 40], opacity: [1, 1, 0, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
      <motion.circle cy="50" r="4" fill="#f59e0b" animate={{ cx: [60, 86], opacity: [0, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }} />
    </>
  );
}

// Arrow function — lambdas / streams / functional interfaces
function LambdaSvg() {
  return (
    <>
      <text x="30" y="55" fontSize="16" fontWeight="bold" fill="#3b82f6">x</text>
      <motion.line x1="42" y1="48" x2="60" y2="48" stroke="#ea580c" strokeWidth="2.5"
        animate={{ pathLength: [0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      <polygon points="60,43 70,48 60,53" fill="#ea580c" />
      <motion.text x="80" y="55" fontSize="16" fontWeight="bold" fill="#16a34a"
        animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
        x²
      </motion.text>
    </>
  );
}

// A record/box with fields snapping into place — records/sealed classes
function RecordSvg() {
  return (
    <>
      <rect x="24" y="30" width="52" height="40" rx="6" fill="none" stroke="#3b82f6" strokeWidth="2" />
      {[0, 1].map(i => (
        <motion.rect
          key={i} x="30" y={38 + i * 16} width="40" height="10" rx="2" fill="#93c5fd"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 30, opacity: 1 }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.2, delay: i * 0.3 }}
        />
      ))}
    </>
  );
}

// Cylinder database with a plug — JDBC
function JdbcSvg() {
  return (
    <>
      <ellipse cx="30" cy="30" rx="14" ry="6" fill="#3b82f6" />
      <rect x="16" y="30" width="28" height="24" fill="#3b82f6" opacity="0.85" />
      <ellipse cx="30" cy="54" rx="14" ry="6" fill="#2563eb" />
      <motion.line x1="44" y1="42" x2="70" y2="42" stroke="#f59e0b" strokeWidth="2.5"
        animate={{ pathLength: [0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      <motion.circle cx="76" cy="42" r="8" fill="#ea580c" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
      <text x="76" y="45" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">J</text>
    </>
  );
}

// Layered arch boxes with a gear — Spring Boot/MVC
function SpringSvg() {
  return (
    <>
      {[
        { y: 22, w: 60, c: '#16a34a', label: 'Controller' },
        { y: 42, w: 48, c: '#3b82f6', label: 'Service' },
        { y: 62, w: 36, c: '#ea580c', label: 'Repo' },
      ].map((l, i) => (
        <motion.g key={l.label} animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}>
          <rect x={50 - l.w / 2} y={l.y} width={l.w} height="14" rx="3" fill={l.c} />
          <text x="50" y={l.y + 10} textAnchor="middle" fontSize="6" fill="#fff">{l.label}</text>
        </motion.g>
      ))}
    </>
  );
}

// Browser-like request/response ping — Servlets/JSP/web
function WebSvg() {
  return (
    <>
      <rect x="14" y="16" width="26" height="20" rx="3" fill="#3b82f6" />
      <text x="27" y="29" textAnchor="middle" fontSize="6" fill="#fff">Client</text>
      <rect x="60" y="58" width="26" height="20" rx="3" fill="#16a34a" />
      <text x="73" y="71" textAnchor="middle" fontSize="6" fill="#fff">Server</text>
      <motion.circle r="4" fill="#ea580c"
        animate={{ cx: [30, 70], cy: [38, 58] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4 }}
      />
      <motion.circle r="4" fill="#f59e0b"
        animate={{ cx: [70, 30], cy: [58, 38] }}
        transition={{ duration: 1, repeat: Infinity, delay: 1, repeatDelay: 0.4 }}
      />
    </>
  );
}

// Table grid with a rippling row select — MySQL/database
function DatabaseSvg() {
  return (
    <>
      {[0, 1, 2].map(row => (
        <g key={row}>
          {[0, 1, 2].map(col => (
            <motion.rect
              key={col}
              x={20 + col * 20} y={24 + row * 16} width="18" height="14"
              fill={row === 1 ? '#ea580c' : '#dbeafe'}
              stroke="#94a3b8" strokeWidth="0.5"
              animate={row === 1 ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ duration: 1.4, repeat: Infinity, delay: col * 0.2 }}
            />
          ))}
        </g>
      ))}
    </>
  );
}

// Browser window with animated tag brackets — HTML/CSS
function HtmlSvg() {
  return (
    <>
      <rect x="14" y="16" width="72" height="54" rx="4" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <line x1="14" y1="28" x2="86" y2="28" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="20" cy="22" r="1.8" fill="#dc2626" />
      <circle cx="26" cy="22" r="1.8" fill="#f59e0b" />
      <motion.text x="50" y="52" fontSize="13" fontWeight="bold" fill="#ea580c" textAnchor="middle"
        animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
        {'<div>'}
      </motion.text>
    </>
  );
}

// Blueprint grid with a highlighted reusable module — design patterns
function PatternSvg() {
  return (
    <>
      <rect x="16" y="16" width="68" height="54" rx="4" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
      <motion.rect
        x="34" y="32" width="32" height="22" rx="4" fill="#2563eb"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={{ originX: '50px', originY: '43px' }}
      />
      <text x="50" y="46" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">reuse</text>
    </>
  );
}

// Ribbon medal — certificates / general achievement-oriented topics (Hibernate/React catch-all)
function CertificateSvg() {
  return (
    <>
      <motion.circle cx="50" cy="36" r="16" fill="#f59e0b" animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity }} style={{ originX: '50px', originY: '36px' }} />
      <circle cx="50" cy="36" r="10" fill="#fff7ed" />
      <text x="50" y="40" textAnchor="middle" fontSize="10" fill="#ea580c" fontWeight="bold">★</text>
      <polygon points="40,48 30,74 44,66" fill="#dc2626" />
      <polygon points="60,48 70,74 56,66" fill="#16a34a" />
    </>
  );
}

// Config file with key=value pairs lighting up — Properties file
function PropertiesSvg() {
  const rows = [
    { key: 'db.url', y: 26 },
    { key: 'db.user', y: 42 },
    { key: 'app.env', y: 58 },
  ];
  return (
    <>
      <rect x="14" y="14" width="72" height="60" rx="5" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <rect x="14" y="14" width="72" height="10" rx="5" fill="#94a3b8" opacity="0.3" />
      {rows.map((r, i) => (
        <motion.g key={r.key} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35 }}>
          <text x="20" y={r.y} fontSize="7" fill="#ea580c" fontFamily="monospace">{r.key}</text>
          <text x="54" y={r.y} fontSize="7" fill="#78716c" fontFamily="monospace">=</text>
          <motion.circle cx="70" cy={r.y - 3} r="3" fill="#16a34a" animate={{ scale: [0.6, 1, 0.6] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35 }} />
        </motion.g>
      ))}
    </>
  );
}

// A class blueprint stamping out object instances — Classes and Objects
function ClassObjectSvg() {
  return (
    <>
      <rect x="30" y="12" width="40" height="26" rx="4" fill="#2563eb" />
      <text x="50" y="22" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">class</text>
      <text x="50" y="32" textAnchor="middle" fontSize="6" fill="#bfdbfe" fontFamily="monospace">Employee</text>
      {[20, 50, 80].map((x, i) => (
        <motion.g
          key={i}
          initial={{ y: 40, opacity: 0, scale: 0.6 }}
          animate={{ y: [40, 70, 70], opacity: [0, 1, 1], scale: [0.6, 1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5, repeatDelay: 0.4 }}
        >
          <rect x={x - 10} y="0" width="20" height="14" rx="3" fill="#ea580c" />
          <text x={x} y="9" textAnchor="middle" fontSize="6" fill="#fff">obj</text>
        </motion.g>
      ))}
    </>
  );
}

// Chat bubbles with Q and A — Interview Questions pages
function InterviewSvg() {
  return (
    <>
      <motion.g animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
        <rect x="14" y="18" width="42" height="26" rx="8" fill="#3b82f6" />
        <polygon points="24,44 24,52 34,44" fill="#3b82f6" />
        <text x="35" y="35" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">Q</text>
      </motion.g>
      <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}>
        <rect x="44" y="52" width="42" height="26" rx="8" fill="#16a34a" />
        <polygon points="76,78 76,70 66,78" fill="#16a34a" />
        <text x="65" y="69" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">A</text>
      </motion.g>
    </>
  );
}

// Interface outline with a concrete method body inside — default methods
function IfaceDefaultSvg() {
  return (
    <>
      <rect x="20" y="14" width="60" height="50" rx="6" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5 3" />
      <text x="50" y="26" textAnchor="middle" fontSize="7" fill="#a855f7" fontFamily="monospace">interface</text>
      <motion.rect
        x="30" y="34" width="40" height="20" rx="4" fill="#a855f7"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      <text x="50" y="47" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace">default</text>
    </>
  );
}

// Folder with a file sliding out, lines being read — Files utility methods
function FilesSvg() {
  return (
    <>
      <path d="M16,32 L36,32 L42,40 L84,40 L84,68 L16,68 Z" fill="#f59e0b" />
      <path d="M16,32 L84,32 L84,38 L16,38 Z" fill="#ea580c" opacity="0.6" />
      <motion.g
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: [0, 0, 30], opacity: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <rect x="34" y="18" width="20" height="24" rx="2" fill="#fff" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="37" y1="24" x2="51" y2="24" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="37" y1="29" x2="51" y2="29" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="37" y1="34" x2="46" y2="34" stroke="#94a3b8" strokeWidth="1.5" />
      </motion.g>
    </>
  );
}

// Triple-quote text block with lines typing in — Text Blocks
function TextBlockSvg() {
  const lines = [24, 36, 48, 60];
  return (
    <>
      <text x="16" y="24" fontSize="14" fill="#ea580c" fontFamily="Georgia, serif">"""</text>
      {lines.map((y, i) => (
        <motion.line
          key={i}
          x1="20" y1={y} x2={70 - i * 8} y2={y}
          stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <text x="16" y="72" fontSize="14" fill="#ea580c" fontFamily="Georgia, serif">"""</text>
    </>
  );
}

// Fixed set of labeled discs — Enums
function EnumSvg() {
  const values = [
    { label: 'MON', x: 26, color: '#3b82f6' },
    { label: 'TUE', x: 50, color: '#ea580c' },
    { label: 'WED', x: 74, color: '#16a34a' },
  ];
  return (
    <>
      <rect x="14" y="12" width="72" height="14" rx="4" fill="#78716c" />
      <text x="50" y="22" textAnchor="middle" fontSize="7" fill="#fff" fontFamily="monospace">enum Day</text>
      {values.map((v, i) => (
        <motion.g key={v.label} animate={{ y: [0, -5, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}>
          <circle cx={v.x} cy="52" r="14" fill={v.color} />
          <text x={v.x} y="55" textAnchor="middle" fontSize="6.5" fill="#fff" fontWeight="bold">{v.label}</text>
        </motion.g>
      ))}
    </>
  );
}

// A box shape-shifting between types — Generics
function GenericsSvg() {
  const types = ['T', 'Integer', 'String'];
  return (
    <>
      <rect x="30" y="34" width="40" height="30" rx="5" fill="none" stroke="#a855f7" strokeWidth="2.5" />
      {types.map((t, i) => (
        <motion.text
          key={t}
          x="50" y="53" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#a855f7"
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8 }}
        >
          {t}
        </motion.text>
      ))}
      <text x="50" y="24" textAnchor="middle" fontSize="10" fill="#78716c" fontFamily="monospace">{'<T>'}</text>
    </>
  );
}

// A tag/label being pinned onto a method — Annotations
function AnnotationSvg() {
  return (
    <>
      <rect x="24" y="42" width="52" height="24" rx="4" fill="#3b82f6" />
      <text x="50" y="57" textAnchor="middle" fontSize="7" fill="#fff" fontFamily="monospace">method()</text>
      <motion.g
        animate={{ y: [-14, 4, 4], opacity: [0, 1, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.6 }}
      >
        <rect x="30" y="14" width="40" height="16" rx="8" fill="#ea580c" />
        <text x="50" y="25" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">@Override</text>
      </motion.g>
    </>
  );
}

// A magnifying glass inspecting a class's hidden internals — Reflection API
function ReflectionSvg() {
  return (
    <>
      <rect x="16" y="18" width="46" height="46" rx="5" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
      <line x1="24" y1="30" x2="54" y2="30" stroke="#93c5fd" strokeWidth="2" />
      <line x1="24" y1="40" x2="48" y2="40" stroke="#93c5fd" strokeWidth="2" />
      <line x1="24" y1="50" x2="52" y2="50" stroke="#93c5fd" strokeWidth="2" />
      <motion.g
        animate={{ x: [0, 14, 0], y: [0, 10, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="58" cy="34" r="14" fill="none" stroke="#ea580c" strokeWidth="3" />
        <line x1="68" y1="44" x2="78" y2="54" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
      </motion.g>
    </>
  );
}

// Two objects compared by a balance/scale — equals() and hashCode()
function EqualsHashcodeSvg() {
  return (
    <>
      <line x1="50" y1="20" x2="50" y2="34" stroke="#78716c" strokeWidth="2.5" />
      <motion.g animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 2, repeat: Infinity }} style={{ originX: '50px', originY: '34px' }}>
        <line x1="20" y1="34" x2="80" y2="34" stroke="#78716c" strokeWidth="2.5" />
        <circle cx="20" cy="48" r="10" fill="#3b82f6" />
        <text x="20" y="51" textAnchor="middle" fontSize="6" fill="#fff">A</text>
        <circle cx="80" cy="48" r="10" fill="#16a34a" />
        <text x="80" y="51" textAnchor="middle" fontSize="6" fill="#fff">B</text>
      </motion.g>
      <motion.text x="50" y="80" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ea580c"
        animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        equals?
      </motion.text>
    </>
  );
}

// Two items being sorted/reordered by an external ruler — Comparable vs Comparator
function ComparatorSvg() {
  const items = [
    { y: 0, color: '#ea580c' },
    { y: 1, color: '#3b82f6' },
    { y: 2, color: '#16a34a' },
  ];
  return (
    <>
      {items.map((it, i) => (
        <motion.rect
          key={i}
          x="24" width="30" height="10" rx="2" fill={it.color}
          animate={{ y: [22 + it.y * 16, 22 + ((it.y + 1) % 3) * 16, 22 + it.y * 16] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      <line x1="66" y1="18" x2="66" y2="66" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
      <text x="76" y="45" fontSize="7" fill="#78716c" fontFamily="monospace">sort</text>
    </>
  );
}

// One object splitting into an identical copy — Object Cloning
function CloningSvg() {
  return (
    <>
      <rect x="18" y="34" width="30" height="26" rx="4" fill="#3b82f6" />
      <text x="33" y="50" textAnchor="middle" fontSize="6" fill="#fff">obj</text>
      <motion.g
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: [0, 34, 34], opacity: [0, 1, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.4 }}
      >
        <rect x="18" y="34" width="30" height="26" rx="4" fill="#16a34a" />
        <text x="33" y="50" textAnchor="middle" fontSize="6" fill="#fff">copy</text>
      </motion.g>
    </>
  );
}

// A method accepting a variable number of stacked boxes — Varargs
function VarargsSvg() {
  const counts = [1, 3, 5];
  return (
    <>
      <rect x="14" y="60" width="72" height="14" rx="3" fill="#78716c" />
      <text x="50" y="70" textAnchor="middle" fontSize="6.5" fill="#fff" fontFamily="monospace">sum(int... n)</text>
      {counts.map((c, ci) => (
        <motion.g
          key={ci}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: ci * 0.6 }}
        >
          {Array.from({ length: c }).map((_, i) => (
            <rect key={i} x={40 + i * 5} y={50 - i * 6} width="10" height="8" rx="1" fill="#ea580c" />
          ))}
        </motion.g>
      ))}
    </>
  );
}

// Parameters flowing into a method box, a result flowing out — Methods in Java
function MethodSvg() {
  return (
    <>
      <rect x="32" y="34" width="36" height="32" rx="5" fill="#3b82f6" />
      <text x="50" y="53" textAnchor="middle" fontSize="7" fill="#fff" fontFamily="monospace">sum()</text>
      {[0, 1].map(i => (
        <motion.circle
          key={i} cy={44 + i * 12} r="3.5" fill="#ea580c"
          animate={{ cx: [10, 30] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <motion.circle
        cy="50" r="4" fill="#16a34a"
        animate={{ cx: [70, 90], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0.8 }}
      />
    </>
  );
}

// Nodes connected by arrows, a new node splicing in — Linked List
function LinkedListSvg() {
  const nodes = [18, 42, 66];
  return (
    <>
      {nodes.map((x, i) => (
        <g key={i}>
          <rect x={x} y="42" width="16" height="16" rx="2" fill="#3b82f6" />
          {i < nodes.length - 1 && (
            <motion.line
              x1={x + 16} y1="50" x2={nodes[i + 1]} y2="50"
              stroke="#ea580c" strokeWidth="2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
            />
          )}
        </g>
      ))}
      <polygon points="80,46 88,50 80,54" fill="#ea580c" />
      <motion.rect
        x="80" y="66" width="16" height="16" rx="2" fill="#16a34a"
        animate={{ y: [66, 42, 42], opacity: [1, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.6 }}
      />
    </>
  );
}

// LIFO plates stacking and popping — Stack
function StackDsSvg() {
  const colors = ['#ea580c', '#f59e0b', '#3b82f6'];
  return (
    <>
      {colors.map((c, i) => (
        <motion.rect
          key={i}
          x="30" width="40" height="14" rx="2" fill={c}
          animate={{ y: [70 - i * 16, 70 - i * 16 - 4, 70 - i * 16] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      <text x="50" y="90" textAnchor="middle" fontSize="6" fill="#78716c">push / pop (LIFO)</text>
    </>
  );
}

// A tunnel with items entering one end, leaving the other — Queue / Deque
function QueueDsSvg() {
  return (
    <>
      <rect x="14" y="38" width="72" height="24" rx="4" fill="none" stroke="#94a3b8" strokeWidth="2" />
      {[0, 1, 2].map(i => (
        <motion.rect
          key={i} y="44" width="12" height="12" rx="2" fill="#ea580c"
          animate={{ x: [90, -10] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'linear' }}
        />
      ))}
      <text x="10" y="34" fontSize="6" fill="#16a34a">in</text>
      <text x="82" y="34" fontSize="6" fill="#dc2626">out</text>
    </>
  );
}

// Keys mapping into buckets via a hash function — Hashing
function HashingDsSvg() {
  const keys = [{ x: 18, y: 14 }, { x: 44, y: 14 }, { x: 70, y: 14 }];
  return (
    <>
      {keys.map((k, i) => (
        <motion.circle
          key={i} cx={k.x} cy={k.y} r="6" fill="#3b82f6"
          animate={{ cy: [14, 34, 34], opacity: [1, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <rect x="20" y="40" width="60" height="12" rx="3" fill="#78716c" />
      <text x="50" y="49" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace">hash(key)</text>
      {[20, 40, 60].map((x, i) => (
        <motion.rect
          key={i} x={x} y="60" width="14" height="14" rx="2" fill="#16a34a"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 + i * 0.3 }}
        />
      ))}
    </>
  );
}

// Bars swapping into ascending order — Sorting
function SortingDsSvg() {
  const heights = [30, 45, 20, 55, 35];
  return (
    <>
      {heights.map((h, i) => (
        <motion.rect
          key={i}
          x={16 + i * 14} width="10" fill="#ea580c" rx="1"
          animate={{ height: [h, 20 + i * 8, 20 + i * 8], y: [74 - h, 74 - (20 + i * 8), 74 - (20 + i * 8)] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </>
  );
}

// A search range narrowing in half each step — Binary/Searching
function SearchingDsSvg() {
  return (
    <>
      <rect x="14" y="42" width="72" height="14" rx="2" fill="#e5e7eb" />
      <motion.rect
        y="42" height="14" fill="#3b82f6" rx="2"
        animate={{ x: [14, 30, 38], width: [72, 36, 18] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      <motion.circle cy="49" r="4" fill="#ea580c" animate={{ cx: [50, 48, 47] }} transition={{ duration: 1.8, repeat: Infinity }} />
    </>
  );
}

// A small binary tree with nodes pulsing top-down — Trees
function TreeDsSvg() {
  return (
    <>
      <line x1="50" y1="22" x2="30" y2="46" stroke="#94a3b8" strokeWidth="2" />
      <line x1="50" y1="22" x2="70" y2="46" stroke="#94a3b8" strokeWidth="2" />
      <line x1="30" y1="46" x2="20" y2="70" stroke="#94a3b8" strokeWidth="2" />
      <line x1="30" y1="46" x2="40" y2="70" stroke="#94a3b8" strokeWidth="2" />
      {[{ x: 50, y: 22, d: 0 }, { x: 30, y: 46, d: 0.2 }, { x: 70, y: 46, d: 0.2 }, { x: 20, y: 70, d: 0.4 }, { x: 40, y: 70, d: 0.4 }].map((n, i) => (
        <motion.circle
          key={i} cx={n.x} cy={n.y} r="7" fill="#16a34a"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: n.d }}
        />
      ))}
    </>
  );
}

// A tree with the top bubbling to the root — Heap
function HeapDsSvg() {
  return (
    <>
      <line x1="50" y1="26" x2="32" y2="48" stroke="#94a3b8" strokeWidth="2" />
      <line x1="50" y1="26" x2="68" y2="48" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="32" cy="48" r="8" fill="#3b82f6" />
      <circle cx="68" cy="48" r="8" fill="#3b82f6" />
      <motion.circle
        cx="50" r="9" fill="#ea580c"
        animate={{ cy: [70, 26, 26], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.4 }}
      />
      <text x="50" y="90" textAnchor="middle" fontSize="6" fill="#78716c">bubble up</text>
    </>
  );
}

// Letters branching into a prefix tree — Trie
function TrieDsSvg() {
  const letters = [{ c: 'C', x: 50, y: 18 }, { c: 'A', x: 34, y: 42 }, { c: 'T', x: 34, y: 66 }, { c: 'R', x: 66, y: 42 }];
  return (
    <>
      <line x1="50" y1="18" x2="34" y2="42" stroke="#94a3b8" strokeWidth="2" />
      <line x1="34" y1="42" x2="34" y2="66" stroke="#94a3b8" strokeWidth="2" />
      <line x1="50" y1="18" x2="66" y2="42" stroke="#94a3b8" strokeWidth="2" />
      {letters.map((l, i) => (
        <motion.g key={i} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}>
          <circle cx={l.x} cy={l.y} r="9" fill="#a855f7" />
          <text x={l.x} y={l.y + 3} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">{l.c}</text>
        </motion.g>
      ))}
    </>
  );
}

// A network of nodes lighting up in a BFS-style wave — Graphs
function GraphDsSvg() {
  const nodes = [{ x: 50, y: 20 }, { x: 24, y: 46 }, { x: 76, y: 46 }, { x: 38, y: 76 }, { x: 62, y: 76 }];
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 4], [1, 2]];
  return (
    <>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="#cbd5e1" strokeWidth="2" />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={i} cx={n.x} cy={n.y} r="7" fill="#16a34a"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
    </>
  );
}

// A call stack of frames growing then unwinding — Recursion & Backtracking
function RecursionDsSvg() {
  const frames = [0, 1, 2, 3];
  return (
    <>
      {frames.map((i) => (
        <motion.rect
          key={i}
          x={30 - i * 2} width={40 + i * 4} height="12" rx="2" fill={['#3b82f6', '#ea580c', '#16a34a', '#a855f7'][i]}
          animate={{ y: [80 - i * 16, 80 - i * 16], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, times: [0, 0.15, 0.7, 1] }}
        />
      ))}
    </>
  );
}

// Coins picked from largest to smallest — Greedy
function GreedyDsSvg() {
  const coins = [{ r: 12, x: 24, v: '10' }, { r: 9, x: 48, v: '5' }, { r: 6, x: 68, v: '1' }];
  return (
    <>
      {coins.map((c, i) => (
        <motion.g key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }}>
          <circle cx={c.x} cy="55" r={c.r} fill="#f59e0b" stroke="#ea580c" strokeWidth="1.5" />
          <text x={c.x} y="58" textAnchor="middle" fontSize="7" fill="#7c2d12" fontWeight="bold">{c.v}</text>
        </motion.g>
      ))}
      <polygon points="45,78 50,86 55,78" fill="#16a34a" />
    </>
  );
}

// A DP table filling cell by cell — Dynamic Programming
function DpDsSvg() {
  const cells = Array.from({ length: 9 }, (_, i) => i);
  return (
    <>
      {cells.map(i => {
        const row = Math.floor(i / 3), col = i % 3;
        return (
          <motion.rect
            key={i}
            x={20 + col * 20} y={20 + row * 20} width="16" height="16" rx="2" fill="#3b82f6"
            animate={{ opacity: [0.15, 1, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
          />
        );
      })}
    </>
  );
}

// A problem splitting in two, then results merging — Divide & Conquer
function DivideConquerDsSvg() {
  return (
    <>
      <rect x="36" y="12" width="28" height="14" rx="2" fill="#3b82f6" />
      <motion.line x1="50" y1="26" x2="26" y2="44" stroke="#94a3b8" strokeWidth="2" animate={{ pathLength: [0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      <motion.line x1="50" y1="26" x2="74" y2="44" stroke="#94a3b8" strokeWidth="2" animate={{ pathLength: [0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      <rect x="12" y="44" width="28" height="14" rx="2" fill="#ea580c" />
      <rect x="60" y="44" width="28" height="14" rx="2" fill="#ea580c" />
      <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
        <line x1="26" y1="58" x2="50" y2="76" stroke="#16a34a" strokeWidth="2" />
        <line x1="74" y1="58" x2="50" y2="76" stroke="#16a34a" strokeWidth="2" />
        <rect x="36" y="76" width="28" height="14" rx="2" fill="#16a34a" />
      </motion.g>
    </>
  );
}

// Bits flipping between 0 and 1 — Bit Manipulation
function BitDsSvg() {
  const bits = [1, 0, 1, 1, 0, 0];
  return (
    <>
      {bits.map((b, i) => (
        <motion.text
          key={i}
          x={16 + i * 12} y="55" fontSize="14" fontWeight="bold" fill="#ea580c" fontFamily="monospace" textAnchor="middle"
          animate={{ opacity: [1, 1, 0.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
        >
          {b}
        </motion.text>
      ))}
    </>
  );
}

// A range of boxes highlighted and collapsed into one summary node — Segment/Fenwick Tree
function SegmentTreeDsSvg() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.rect
          key={i} x={12 + i * 13} y="60" width="10" height="14" rx="1" fill="#93c5fd"
          animate={{ fill: ['#93c5fd', '#2563eb', '#93c5fd'] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
      <motion.circle cx="50" cy="24" r="10" fill="#ea580c" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
      <line x1="30" y1="60" x2="45" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="70" y1="60" x2="55" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
    </>
  );
}

// Points on a plane with a hull line wrapping them — Computational Geometry
function GeometryDsSvg() {
  const pts = [{ x: 24, y: 66 }, { x: 20, y: 34 }, { x: 50, y: 16 }, { x: 78, y: 30 }, { x: 74, y: 68 }, { x: 46, y: 52 }];
  const hull = [0, 1, 2, 3, 4, 0];
  return (
    <>
      <motion.polyline
        points={hull.map(i => `${pts[i].x},${pts[i].y}`).join(' ')}
        fill="none" stroke="#ea580c" strokeWidth="2"
        animate={{ pathLength: [0, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
      ))}
    </>
  );
}

// Two arrows moving toward each other over a row of cells — Two Pointers / Sliding Window
function TwoPointerDsSvg() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={14 + i * 12} y="42" width="10" height="16" rx="2" fill="#e5e7eb" />
      ))}
      <motion.polygon points="0,-6 8,0 0,6" fill="#16a34a" animate={{ x: [18, 60], y: 50 }} transition={{ duration: 1.6, repeat: Infinity }} />
      <motion.polygon points="0,-6 -8,0 0,6" fill="#ea580c" animate={{ x: [78, 36], y: 50 }} transition={{ duration: 1.6, repeat: Infinity }} />
    </>
  );
}

// A growing curve — Big-O / Complexity Foundations
function ComplexityDsSvg() {
  return (
    <>
      <line x1="14" y1="80" x2="86" y2="80" stroke="#94a3b8" strokeWidth="2" />
      <line x1="14" y1="80" x2="14" y2="14" stroke="#94a3b8" strokeWidth="2" />
      <motion.path
        d="M 16 76 Q 40 74 55 50 T 84 18"
        fill="none" stroke="#ea580c" strokeWidth="2.5"
        animate={{ pathLength: [0, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      <text x="86" y="12" fontSize="7" fill="#78716c" textAnchor="end">O(n&sup2;)</text>
    </>
  );
}

function DefaultSvg() {
  return (
    <>
      <text x="28" y="58" fontSize="34" fill="#ea580c" fontFamily="monospace">{'{'}</text>
      <text x="62" y="58" fontSize="34" fill="#ea580c" fontFamily="monospace">{'}'}</text>
      <motion.rect
        x="48" y="38" width="4" height="18" fill="#f59e0b"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </>
  );
}

const kindToSvg: Record<VisualKind, () => JSX.Element> = {
  inheritance: InheritanceSvg,
  encapsulation: EncapsulationSvg,
  polymorphism: PolymorphismSvg,
  abstraction: AbstractionSvg,
  access: AccessSvg,
  exception: ExceptionSvg,
  collection: CollectionSvg,
  introduction: IntroductionSvg,
  jvm: JvmSvg,
  datatype: DataTypeSvg,
  operator: OperatorSvg,
  control: ControlSvg,
  loop: LoopSvg,
  jump: JumpSvg,
  package: PackageSvg,
  string: StringSvg,
  constructor: ConstructorSvg,
  static: StaticSvg,
  iostream: IoStreamSvg,
  serialization: SerializationSvg,
  final: FinalSvg,
  wrapper: WrapperSvg,
  thisSuper: ThisSuperSvg,
  thread: ThreadSvg,
  sync: SyncSvg,
  lambda: LambdaSvg,
  record: RecordSvg,
  jdbc: JdbcSvg,
  spring: SpringSvg,
  web: WebSvg,
  database: DatabaseSvg,
  html: HtmlSvg,
  pattern: PatternSvg,
  certificate: CertificateSvg,
  properties: PropertiesSvg,
  classObject: ClassObjectSvg,
  interview: InterviewSvg,
  ifaceDefault: IfaceDefaultSvg,
  files: FilesSvg,
  textBlock: TextBlockSvg,
  method: MethodSvg,
  enum: EnumSvg,
  generics: GenericsSvg,
  annotation: AnnotationSvg,
  reflection: ReflectionSvg,
  equalsHashcode: EqualsHashcodeSvg,
  comparator: ComparatorSvg,
  cloning: CloningSvg,
  varargs: VarargsSvg,
  linkedList: LinkedListSvg,
  stackDs: StackDsSvg,
  queueDs: QueueDsSvg,
  hashingDs: HashingDsSvg,
  sortingDs: SortingDsSvg,
  searchingDs: SearchingDsSvg,
  treeDs: TreeDsSvg,
  heapDs: HeapDsSvg,
  trieDs: TrieDsSvg,
  graphDs: GraphDsSvg,
  recursionDs: RecursionDsSvg,
  greedyDs: GreedyDsSvg,
  dpDs: DpDsSvg,
  divideConquerDs: DivideConquerDsSvg,
  bitDs: BitDsSvg,
  segmentTreeDs: SegmentTreeDsSvg,
  geometryDs: GeometryDsSvg,
  twoPointerDs: TwoPointerDsSvg,
  complexityDs: ComplexityDsSvg,
  default: DefaultSvg,
};

interface TopicVisualProps {
  topicId: string;
  topicName: string;
  /** 'sm' = small corner icon (default), 'lg' = full-width banner panel for a "concept animation" showcase */
  size?: 'sm' | 'lg';
}

// Looping animated SVG diagram, auto-chosen per topic — no external images/videos needed.
export function TopicVisual({ topicId, topicName, size = 'sm' }: TopicVisualProps) {
  const kind = detectKind(topicId, topicName);
  const Svg = kindToSvg[kind];

  if (size === 'lg') {
    return (
      <div className="w-full h-20 sm:h-24 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/25 dark:to-amber-900/10 border border-orange-200 dark:border-orange-800/50 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
          <Svg />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/25 dark:to-amber-900/10 border border-orange-200 dark:border-orange-800/50 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-10 h-10 sm:w-12 sm:h-12">
        <Svg />
      </svg>
    </div>
  );
}
