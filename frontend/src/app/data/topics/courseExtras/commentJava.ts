// Adds a short end-of-line "// ..." comment to every Java statement of a code sample that does not already have one,
// so each line of the Collection Framework examples explains itself. Pure and idempotent: existing comments are never
// touched, blank lines, braces, block comments and text blocks are skipped, and running it twice changes nothing.

type Kind = 'list' | 'set' | 'map' | 'queue' | 'deque' | 'stack' | 'collection';

const CONTROL = new Set(['if', 'for', 'while', 'switch', 'catch', 'synchronized', 'try', 'else', 'do', 'return', 'new', 'throw']);

const kindOf = (type: string): Kind => {
  const t = type.replace(/<.*$/, '').trim();
  if (/Map$|Hashtable|Dictionary|Properties/.test(t)) return 'map';
  if (/Set$/.test(t)) return 'set';
  if (/^(Stack)$/.test(t)) return 'stack';
  if (/Deque$|ArrayDeque/.test(t)) return 'deque';
  if (/Queue$/.test(t)) return 'queue';
  if (/List$|Vector|Arrays/.test(t)) return 'list';
  return 'collection';
};

const noun = (k: Kind) => ({ list: 'the list', set: 'the set', map: 'the map', queue: 'the queue', deque: 'the deque', stack: 'the stack', collection: 'the collection' }[k]);

const article = (w: string) => (/^[AEIOUaeiou]/.test(w) ? 'an' : 'a');

const clip = (s: string, n = 34) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '...' : s);

/** What a println argument shows, in a few words. */
function printWhat(arg: string): string {
  const a = arg.trim();
  const lit = a.match(/^"([^"]*)"$/);
  if (lit) return `the text "${clip(lit[1], 28)}"`;
  const has = (re: RegExp) => re.test(a);
  if (has(/\.size\(\)/)) return 'the number of elements';
  if (has(/\.isEmpty\(\)/)) return 'whether it is empty';
  if (has(/\.contains(Key|Value|All)?\(/)) return 'whether the element is present';
  if (has(/\.indexOf\(|\.lastIndexOf\(/)) return 'the index of the element';
  if (has(/\.(get|getFirst|getLast|getOrDefault|first|last|firstKey|lastKey|peek|peekFirst|peekLast|element)\(/)) return 'the element or value read';
  if (has(/\.(remove|poll|pop|removeFirst|removeLast|pollFirst|pollLast)\(/)) return 'the removed element';
  if (has(/\.(add|offer|push|put)\w*\(/)) return 'the result of the add';
  if (has(/\.(hasNext|hasPrevious)\(\)/)) return 'whether more elements exist';
  if (has(/\.(next|previous)\(\)/)) return 'the next element';
  if (has(/\.(subList|headSet|tailSet|subSet|headMap|tailMap|subMap)\(/)) return 'the selected range';
  if (has(/\.(keySet|values|entrySet)\(\)/)) return 'the keys, values or entries';
  if (has(/\.(ceiling|floor|higher|lower)\w*\(/)) return 'the nearest element';
  if (has(/\.(compare|compareTo|equals|hashCode)\(/)) return 'the comparison result';
  if (/^"[^"]*"\s*\+/.test(a)) return 'a label followed by the value';
  if (/^[A-Za-z_]\w*$/.test(a)) return a;
  return 'the result';
}

/** Splits the top-level arguments of a call "(a, b(c, d), e)" -> ["a", "b(c, d)", "e"]. */
function splitArgs(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '', inStr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"' && s[i - 1] !== '\\') inStr = !inStr;
    if (!inStr) {
      if ('([{<'.includes(c)) depth++;
      if (')]}>'.includes(c)) depth--;
      if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function callComment(recv: string, method: string, args: string[], kinds: Record<string, Kind>): string | null {
  const k = kinds[recv] ?? 'collection';
  const n = noun(k);
  const a0 = args[0] ? clip(args[0]) : '';
  const a1 = args[1] ? clip(args[1]) : '';
  switch (method) {
    case 'add': return args.length === 2 ? `inserts ${a1} at index ${a0}` : k === 'set' ? `adds ${a0} to the set (a duplicate is ignored)` : k === 'queue' ? `adds ${a0} at the tail of the queue` : `adds ${a0} to the end of the list`;
    case 'addAll': return args.length === 2 ? `inserts all elements of ${a1} at index ${a0}` : `adds every element of ${a0} to ${n}`;
    case 'addFirst': return `adds ${a0} at the front`;
    case 'addLast': return `adds ${a0} at the end`;
    case 'offer': case 'offerLast': return `adds ${a0} at the tail without throwing if the queue is full`;
    case 'offerFirst': return `adds ${a0} at the head`;
    case 'push': return `pushes ${a0} on top of the stack`;
    case 'pop': return `removes the element on top`;
    case 'peek': case 'peekFirst': return `reads the head without removing it`;
    case 'peekLast': return 'reads the last element without removing it';
    case 'poll': case 'pollFirst': return `removes and returns the head (null if empty)`;
    case 'pollLast': return 'removes and returns the last element (null if empty)';
    case 'element': return 'reads the head, throws if empty';
    case 'remove': return args.length === 0 ? 'removes the head element' : k === 'map' ? `removes the entry for key ${a0}` : /^\d+$/.test(args[0]) || /\bindex\b|^i$/.test(args[0]) ? `removes the element at index ${a0}` : `removes ${a0} from ${n}`;
    case 'removeFirst': return 'removes the first element';
    case 'removeLast': return 'removes the last element';
    case 'removeIf': return 'removes every element that matches the condition';
    case 'removeAll': return `removes all elements that are in ${a0}`;
    case 'retainAll': return `keeps only the elements that are also in ${a0}`;
    case 'removeElement': return `removes the first occurrence of ${a0}`;
    case 'removeElementAt': return `removes the element at index ${a0}`;
    case 'removeAllElements': return 'removes every element';
    case 'clear': return `removes every element from ${n}`;
    case 'set': return k === 'list' || k === 'collection' ? `replaces the element at index ${a0} with ${a1}` : null;
    case 'get': return k === 'map' || (k === 'collection' && /^"/.test(args[0] ?? '')) ? `reads the value stored for key ${a0}` : `reads the element at index ${a0}`;
    case 'getFirst': return 'reads the first element';
    case 'getLast': return 'reads the last element';
    case 'first': case 'firstKey': return 'reads the smallest element';
    case 'last': case 'lastKey': return 'reads the largest element';
    case 'size': return 'reads the number of elements';
    case 'isEmpty': return 'checks whether it has no elements';
    case 'contains': return `checks whether ${a0} is present`;
    case 'containsAll': return `checks whether all elements of ${a0} are present`;
    case 'containsKey': return `checks whether key ${a0} exists`;
    case 'containsValue': return `checks whether value ${a0} exists`;
    case 'indexOf': return `finds the first index of ${a0}`;
    case 'lastIndexOf': return `finds the last index of ${a0}`;
    case 'subList': return `takes the view from index ${a0} (inclusive) to ${a1} (exclusive)`;
    case 'sort': return args[0] === 'null' ? 'sorts in natural order' : 'sorts using the given comparator';
    case 'forEach': return 'runs the given action for every element';
    case 'iterator': return 'gets an iterator to walk the elements';
    case 'listIterator': return 'gets a list iterator that can move in both directions';
    case 'descendingIterator': return 'gets an iterator that walks in reverse order';
    case 'spliterator': return 'gets a spliterator for parallel traversal';
    case 'stream': return 'creates a stream of the elements';
    case 'toArray': return 'copies the elements into an array';
    case 'clone': return 'creates a shallow copy';
    case 'ensureCapacity': return `makes sure the capacity is at least ${a0}`;
    case 'trimToSize': return 'shrinks the capacity to the current size';
    case 'replaceAll': return 'replaces every element using the given operator';
    case 'put': return `maps key ${a0} to value ${a1}`;
    case 'putAll': return `copies every entry of ${a0} into the map`;
    case 'putIfAbsent': return `stores ${a1} for key ${a0} only if the key has no value yet`;
    case 'getOrDefault': return `reads the value for ${a0} or ${a1} if the key is missing`;
    case 'keySet': return 'gets the set of keys';
    case 'values': return 'gets the collection of values';
    case 'entrySet': return 'gets the set of key-value entries';
    case 'merge': return 'combines the old and new value for the key';
    case 'compute': case 'computeIfAbsent': case 'computeIfPresent': return 'computes the value for the key';
    case 'headSet': case 'headMap': return `takes the part before ${a0}`;
    case 'tailSet': case 'tailMap': return `takes the part from ${a0} onwards`;
    case 'subSet': case 'subMap': return `takes the range from ${a0} to ${a1}`;
    case 'ceiling': case 'ceilingKey': return `finds the smallest element >= ${a0}`;
    case 'floor': case 'floorKey': return `finds the largest element <= ${a0}`;
    case 'higher': case 'higherKey': return `finds the smallest element > ${a0}`;
    case 'lower': case 'lowerKey': return `finds the largest element < ${a0}`;
    case 'descendingSet': case 'descendingMap': return 'gets the reverse-ordered view';
    case 'pollFirstEntry': case 'pollLastEntry': return 'removes and returns the first/last entry';
    case 'hasNext': return 'checks whether more elements exist';
    case 'next': return 'moves to and returns the next element';
    case 'hasPrevious': return 'checks whether an earlier element exists';
    case 'previous': return 'moves to and returns the previous element';
    case 'elements': case 'keys': return 'gets an enumeration to walk through';
    case 'firstElement': return 'reads the first element';
    case 'lastElement': return 'reads the last element';
    case 'elementAt': return `reads the element at index ${a0}`;
    case 'addElement': return `adds ${a0} at the end`;
    case 'insertElementAt': return `inserts ${a0} at index ${a1}`;
    case 'setElementAt': return `replaces the element at index ${a1} with ${a0}`;
    case 'capacity': return 'reads the current capacity';
    case 'search': return `finds the position of ${a0} counted from the top`;
    case 'empty': return 'checks whether the stack is empty';
    case 'start': return 'starts the thread';
    case 'join': return 'waits for the thread to finish';
    case 'sleep': return 'pauses for the given time';
    case 'equals': return 'compares for equality';
    case 'hashCode': return 'computes the hash code';
    case 'toString': return 'builds the text form';
    case 'name': return null;
    default: return null;
  }
}

function staticComment(cls: string, method: string, args: string[]): string | null {
  const a0 = args[0] ? clip(args[0]) : '';
  if (cls === 'Collections') {
    const m: Record<string, string> = {
      sort: 'sorts the list (natural order or the given comparator)', reverse: 'reverses the order of the elements', shuffle: 'shuffles the elements randomly',
      max: 'finds the largest element', min: 'finds the smallest element', swap: 'swaps two elements', binarySearch: 'searches a sorted list for the element',
      frequency: 'counts how often the element occurs', unmodifiableList: 'creates a read-only view', unmodifiableSet: 'creates a read-only view', unmodifiableMap: 'creates a read-only view',
      synchronizedList: 'creates a thread-safe view', synchronizedMap: 'creates a thread-safe view', synchronizedSet: 'creates a thread-safe view', emptyList: 'creates an empty immutable list',
      singletonList: 'creates an immutable list with one element', addAll: 'adds all the given elements', reverseOrder: 'gets a comparator for reverse order', copy: 'copies the elements into the destination list',
      fill: 'replaces every element with the value', nCopies: 'creates a list with the same element repeated', rotate: 'rotates the elements by the given distance',
    };
    return m[method] ?? null;
  }
  if (cls === 'Arrays') return ({ asList: 'wraps the array as a fixed-size list', sort: 'sorts the array', toString: 'builds the text form of the array', fill: 'fills the array with the value', copyOf: 'copies the array to a new length', stream: 'creates a stream from the array' } as Record<string, string>)[method] ?? null;
  if (cls === 'Thread' && method === 'sleep') return 'pauses the current thread';
  if (cls === 'System' && method === 'exit') return 'stops the program';
  if (cls === 'Objects') return ({ hash: 'computes a hash code from the fields', equals: 'compares two objects safely', requireNonNull: 'throws if the value is null' } as Record<string, string>)[method] ?? null;
  return a0 ? null : null;
}

export function commentLine(line: string, ctx: { kinds: Record<string, Kind>; hasMain: boolean; classCount: { n: number } }): string | null {
  const t = line.trim();
  if (!t || t === '{' || t === '}' || t === '};' || t === '});' || t === ');' || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.includes('//')) return null;
  if (!/[;{]$/.test(t)) return null;           // a continuation line of a longer statement: leave it
  let m: RegExpMatchArray | null;

  if ((m = t.match(/^package\s+([\w.]+);$/))) return 'package this class belongs to';
  if ((m = t.match(/^import\s+static\s+/))) return 'static import';
  if ((m = t.match(/^import\s+([\w.]+)\.\*;$/))) return `imports every class of ${m[1]}`;
  if ((m = t.match(/^import\s+[\w.]*\.(\w+);$/))) return `imports the ${m[1]} class`;

  if ((m = t.match(/^(?:(?:public|private|protected|final|abstract|static|sealed)\s+)*(class|interface|enum|record)\s+(\w+)/))) {
    const [, kind, name] = m;
    if (kind === 'class' && ctx.hasMain && ctx.classCount.n++ === 0 && /public\s+class/.test(t)) return 'class that holds the main method';
    const impl = t.match(/implements\s+([\w<>, ]+?)\s*\{?$/);
    const ext = t.match(/extends\s+([\w.]+(?:<.*?>)?)\s*(?:implements|\{|$)/);
    if (impl) return `${name} ${kind} implementing ${clip(impl[1].trim(), 28)}`;
    if (ext) return `${name} ${kind} extending ${clip(ext[1], 30)}`;
    return `declares the ${name} ${kind}`;
  }
  if (/static\s+void\s+main\s*\(/.test(t)) return 'program entry point';
  if (/^@Override\b/.test(t)) return 'overrides the method of the parent type';
  if (/^@FunctionalInterface\b/.test(t)) return 'interface with a single abstract method';
  if (/^@\w+/.test(t)) return null;

  // control flow
  if ((m = t.match(/^for\s*\(\s*(?:final\s+)?[\w<>\[\], ?.]+\s+(\w+)\s*:\s*(.+?)\s*\)\s*\{$/))) return `loops over every element of ${clip(m[2], 30)}`;
  if (/^for\s*\(\s*int\s/.test(t)) return /\.size\(\)|\.length/.test(t) ? 'loops through all the indexes' : 'counting loop';
  if ((m = t.match(/^while\s*\((.+)\)\s*\{$/))) return /hasNext\(\)/.test(m[1]) ? 'runs while the iterator has more elements' : /hasPrevious\(\)/.test(m[1]) ? 'runs while there is an earlier element' : /isEmpty\(\)/.test(m[1]) ? 'runs until the collection is empty' : 'repeats while the condition is true';
  if (/^\}?\s*else\s+if\s*\(/.test(t)) return 'checks the next condition';
  if (/^\}?\s*else\s*\{$/.test(t)) return 'runs when the condition is false';
  if (/^if\s*\(/.test(t)) return /\.contains|containsKey|containsValue/.test(t) ? 'checks whether the element is present' : /\.isEmpty\(\)/.test(t) ? 'checks whether it is empty' : /instanceof/.test(t) ? 'checks the type of the object' : /==\s*null|!=\s*null/.test(t) ? 'checks for null' : 'checks the condition';
  if (/^switch\s*\(/.test(t)) return 'chooses a branch by value';
  if (/^case\s/.test(t) || /^default\s*:/.test(t)) return null;
  if (/^try\s*(\(|\{)/.test(t)) return 'code that may throw an exception';
  if ((m = t.match(/^\}?\s*catch\s*\(\s*([\w.| ]+?)\s+\w+\s*\)/))) return `handles ${m[1]}`;
  if (/^\}?\s*finally\s*\{$/.test(t)) return 'always runs, with or without an exception';
  if (/^synchronized\s*\(/.test(t)) return 'only one thread at a time may run this block';
  if ((m = t.match(/^throw\s+new\s+(\w+)/))) return `throws ${m[1]}`;
  if (/^break;$/.test(t)) return 'leaves the loop or switch';
  if (/^continue;$/.test(t)) return 'skips to the next iteration';
  if ((m = t.match(/^return\s+(.+);$/))) return /compare|\-/.test(m[1]) && /\.compare|compareTo|\bo\d?\b|this\./.test(m[1]) ? 'returns the comparison result' : 'returns the result to the caller';
  if (/^return;$/.test(t)) return 'ends the method';

  // method declarations
  if ((m = t.match(/^(?:(?:public|private|protected|static|final|abstract|synchronized)\s+)*(?:<[^>]+>\s+)?[\w<>\[\],.? ]+?\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w, ]+)?\s*\{$/)) && !CONTROL.has(m[1])) {
    const name = m[1];
    const special: Record<string, string> = { compareTo: 'natural ordering: negative, zero or positive', compare: 'custom ordering of two objects', equals: 'decides when two objects are equal', hashCode: 'hash code consistent with equals()', toString: 'text shown when the object is printed' };
    if (special[name]) return special[name];
    if (/^get[A-Z]/.test(name)) return 'getter';
    if (/^set[A-Z]/.test(name)) return 'setter';
    return `method ${name}()`;
  }
  if ((m = t.match(/^(?:(?:public|private|protected)\s+)?([A-Z]\w*)\s*\(([^)]*)\)\s*\{$/)) && !CONTROL.has(m[1])) return 'constructor';
  if ((m = t.match(/^this\.(\w+)\s*=\s*(.+);$/))) return `stores ${clip(m[2], 22)} in the field ${m[1]}`;
  if (/^while\s*\(.+\)\s*;$/.test(t)) return 'repeats until the call returns false';
  if ((m = t.match(/^(\w+)\.(\w+)\((.*)\{$/)) && !/^(if|for|while|switch)$/.test(m[2])) return callComment(m[1], m[2], splitArgs(m[3].replace(/\)\s*-?>?\s*$/, '')), ctx.kinds) ?? `calls ${m[2]}() with a lambda`;

  // declarations
  if ((m = t.match(/^(?:final\s+)?([\w<>\[\],.? ]+?)\s+(\w+)\s*=\s*new\s+([\w.]+)\s*(<[^()]*>)?\s*\((.*)\)\s*(\{)?;?$/))) {
    const [, type, name, cls, , args] = m;
    const a = args.trim();
    const isColl = /(List|Set|Map|Queue|Deque|Stack|Vector|Hashtable)$/.test(cls) || /^(Array|Linked|Hash|Tree|Priority|Copy)/.test(cls);
    if (isColl) {
      if (!a) return `creates an empty ${cls} named ${name}`;
      if (/^\d+$/.test(a)) return `creates ${article(cls)} ${cls} with initial capacity ${a}`;
      if (/Comparator|->|::|compare/.test(a)) return `creates ${article(cls)} ${cls} ordered by the given comparator`;
      if (/List\.of|Arrays\.asList|Set\.of/.test(a)) return `creates ${article(cls)} ${cls} filled with the listed values`;
      return `creates ${article(cls)} ${cls} named ${name} copied from ${clip(a, 26)}`;
    }
    if (cls === 'Thread') return `creates a thread named ${name}`;
    if (cls === 'Scanner') return 'creates a scanner to read input';
    if (cls === 'Random') return 'creates a random number generator';
    if (/^(String|StringBuilder|Integer|Object)$/.test(cls)) return `creates ${article(cls)} ${cls} object named ${name}`;
    return `creates ${article(cls)} ${cls} object named ${name}`;
  }
  if ((m = t.match(/^(?:final\s+)?([\w<>\[\],.? ]+?)\s+(\w+)\s*=\s*new\s+(\w+)\s*\[(\w*)\]/))) return `creates an array named ${m[2]}`;
  if ((m = t.match(/^(?:final\s+)?([\w<>\[\],.? ]+?)\s+(\w+)\s*=\s*(List|Set|Map|Arrays)\.(of|asList|copyOf)\(/))) return m[3] === 'Arrays' ? `${m[2]} wraps the values as a fixed-size list` : `${m[2]} is an immutable ${m[3].toLowerCase()} of the listed values`;
  if ((m = t.match(/^(?:final\s+)?([\w<>\[\],.? ]+?)\s+(\w+)\s*=\s*(.+);$/)) && !/^(return|else)$/.test(m[1])) {
    const [, type, name, expr] = m;
    const call = expr.replace(/^\([\w<>?, .]+\)\s*/, '').match(/^(\w+)\.(\w+)\((.*)\)$/);
    if (call) {
      const [, recv, method, rawArgs] = call;
      const c = callComment(recv, method, splitArgs(rawArgs), ctx.kinds);
      if (c) return `stores the result: ${c}`;
    }
    if (/^(int|long|double|float|short|byte|char|boolean)$/.test(type.trim())) return `declares ${type.trim()} ${name} with value ${clip(expr, 20)}`;
    if (/^"/.test(expr)) return `stores the text ${clip(expr, 22)} in ${name}`;
    return `stores the value in ${name}`;
  }
  if ((m = t.match(/^((?:(?:public|private|protected|static|final|volatile|transient)\s+)*)([\w<>\[\],.? ]+?)\s+(\w+);$/)) && /^[A-Za-z]/.test(m[2]) && !CONTROL.has(m[2].trim()) && !/^(break|continue|return|throw)$/.test(m[2])) return /(private|public|protected)/.test(m[1]) ? `field ${m[3]} of type ${m[2].trim()}` : `declares ${m[3]} of type ${m[2].trim()}`;

  // printing
  if ((m = t.match(/^System\.(?:out|err)\.(println|print|printf)\((.*)\);$/))) {
    const args = splitArgs(m[2]);
    if (m[1] === 'printf') return 'prints formatted text';
    if (!m[2].trim()) return 'prints an empty line';
    return `prints ${printWhat(args.join(', ') === m[2].trim() ? m[2] : args[0])}`;
  }

  // method calls on a receiver
  if ((m = t.match(/^(\w+)\.(\w+)\((.*)\)\s*(?:\{)?;?$/))) {
    const [, recv, method, raw] = m;
    const args = splitArgs(raw);
    if (/^[A-Z]/.test(recv)) { const sc = staticComment(recv, method, args); if (sc) return sc; }
    const c = callComment(recv, method, args, ctx.kinds);
    if (c) return c;
    return `calls ${method}() on ${recv}`;
  }
  if (/^super\s*\(/.test(t)) return 'calls the parent class constructor';
  if ((m = t.match(/^(?:final\s+)?[\w<>?, ]+\s+(\w+)\s*=\s*\([^)]*\)\s*->\s*\{$/))) return `defines ${m[1]} as a lambda`;
  if ((m = t.match(/^((?:[a-z]\w*\.)+)([A-Z]\w*)\.(\w+)\((.*)\);$/))) { const sc = staticComment(m[2], m[3], splitArgs(m[4])); if (sc) return sc; }
  if ((m = t.match(/^(\w+)\.(\w+)\s*=\s*(.+);$/))) return `sets the field ${m[2]} of ${m[1]}`;
  if ((m = t.match(/^(\w+)\[(.+?)\]\s*=\s*(.+);$/))) return `stores ${clip(m[3], 18)} at index ${clip(m[2], 14)} of ${m[1]}`;
  if ((m = t.match(/^(\w+)\.(\w+)\.(\w+)\(/))) return `calls ${m[3]}()`;
  if ((m = t.match(/^(\w+)\s*(=|\+=|-=|\*=)\s*(.+);$/))) return m[2] === '=' ? `assigns a new value to ${m[1]}` : `updates ${m[1]}`;
  if ((m = t.match(/^(\w+)(\+\+|--);$/))) return `${m[2] === '++' ? 'increments' : 'decrements'} ${m[1]}`;
  if ((m = t.match(/^(\w+)\((.*)\);$/))) return `calls the ${m[1]}() method`;
  return null;
}

/** True for samples that look like Java (not HTML, SQL or plain text). */
function looksLikeJava(code: string): boolean {
  if (/^\s*</.test(code)) return false;
  return /;\s*$|;\s*\/\//m.test(code) && /\b(class|import|System\.out|List<|Map<|Set<|Iterator<|Collections\.|new\s+\w+)|\.(add|put|remove|iterator)\(/.test(code);
}

// ---- formatting helpers -------------------------------------------------------------------------------------------------

/** Walks a line and reports, for each character, whether it is inside a string or char literal. */
function codeMask(line: string): boolean[] {
  const mask = new Array<boolean>(line.length).fill(true);   // true = real code
  let str: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (str) {
      mask[i] = false;
      if (c === '\\') { if (i + 1 < line.length) mask[++i] = false; continue; }
      if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'") { str = c; mask[i] = false; continue; }
    if (c === '/' && line[i + 1] === '/') { for (let j = i; j < line.length; j++) mask[j] = false; break; }
  }
  return mask;
}

/** Index where a trailing "//" comment starts (outside strings), or -1. */
function commentStart(line: string): number {
  let str: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (str) { if (c === '\\') { i++; continue; } if (c === str) str = null; continue; }
    if (c === '"' || c === "'") { str = c; continue; }
    if (c === '/' && line[i + 1] === '/') return i;
  }
  return -1;
}

/** Index of the ")" that closes the "(" at position open (string-aware), or -1. */
function matchParen(t: string, open: number): number {
  const mask = codeMask(t);
  let depth = 0;
  for (let i = open; i < t.length; i++) {
    if (!mask[i]) continue;
    if (t[i] === '(') depth++;
    else if (t[i] === ')') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

/** "a; b;" -> ["a;", "b;"] for lines with no braces and no comment; other lines are returned unchanged. */
function splitStatements(t: string): string[] {
  if (/[{}]/.test(t) || commentStart(t) >= 0 || /^for\s*\(/.test(t)) return [t];
  const mask = codeMask(t);
  const parts: string[] = [];
  let depth = 0, cur = '';
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (mask[i]) { if (c === '(' || c === '[') depth++; if (c === ')' || c === ']') depth--; }
    cur += c;
    if (c === ';' && mask[i] && depth === 0) { parts.push(cur.trim()); cur = ''; }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts.length > 1 && parts.every(p => p.endsWith(';')) ? parts : [t];
}

/** "if (c) a; else b;" / "while (c) stmt;" / "for (...) stmt;" -> braces on separate lines. */
function expandControl(t: string): string[] {
  const el = t.match(/^(\}\s*)?else\s+(?!if\b|\{)(.+;)$/);
  if (el) return [(el[1] ?? '') + 'else {', ...expandBody(el[2]), '}'];
  const head = t.match(/^(if|for|while)\s*\(/);
  if (!head) return [t];
  const open = t.indexOf('(', head[1].length);
  const close = matchParen(t, open);
  if (close < 0) return [t];
  const header = t.slice(0, close + 1);
  const rest = t.slice(close + 1).trim();
  if (!rest || rest.startsWith('{') || rest === ';' || commentStart(rest) >= 0) return [t];
  if (!rest.endsWith(';') && !/^(if|for|while)\b/.test(rest)) return [t];
  if (head[1] === 'if') {
    const mask = codeMask(rest);
    const m = /;\s*else\s+/.exec(rest);
    if (m && mask[m.index]) {
      const thenPart = rest.slice(0, m.index + 1);
      const elsePart = rest.slice(m.index + m[0].length);
      return [header + ' {', ...expandBody(thenPart), '} else {', ...expandBody(elsePart), '}'];
    }
  }
  return [header + ' {', ...expandBody(rest), '}'];
}

/** "@Override void f() { return 1; }" and "} catch (E e) { stmt; }" -> annotation, header, body and closing brace on separate lines. */
function expandInline(t: string): string[] {
  const ann = t.match(/^(@\w+(?:\([^)]*\))?)\s+(\S.*)$/);
  if (ann && /[({]/.test(ann[2])) return [ann[1], ...expandInline(ann[2])];
  const m = t.match(/^(.*?(?:\)|\belse|\btry|\bfinally))\s*\{\s*(.+;)\s*\}$/);
  if (m && !/^(if|for|while)\b/.test(m[1]) && !/\b(new|->)\b|=\s*$/.test(m[1])) {
    const head = m[1].trim();
    return [head + ' {', ...splitStatements(m[2].trim()).map(x => '    ' + x), '}'];
  }
  return [t];
}

function expandBody(stmt: string): string[] {
  return splitStatements(stmt.trim()).flatMap(p => expandControl(p)).map(l => '    ' + l);
}

function braceDelta(t: string): { open: number; close: number; leadingClose: boolean } {
  const mask = codeMask(t);
  let open = 0, close = 0;
  for (let i = 0; i < t.length; i++) { if (!mask[i]) continue; if (t[i] === '{') open++; else if (t[i] === '}') close++; }
  return { open, close, leadingClose: t.startsWith('}') };
}

/** Rebuilds the indentation from the brace structure (4 spaces per level); samples with switch or text blocks are left alone. */
function reindent(lines: string[]): string[] {
  if (lines.some(l => /\bswitch\b|"""/.test(l))) return lines;
  const out: string[] = [];
  let depth = 0, inBlock = false, prevOpen = '';
  for (const raw of lines) {
    const t = raw.trim();
    if (inBlock) { out.push(raw); if (t.includes('*/')) inBlock = false; continue; }
    if (t.startsWith('/*') && !t.includes('*/')) { inBlock = true; out.push(raw); continue; }
    if (!t) { out.push(''); continue; }
    if (t.startsWith('//')) {
      out.push(' '.repeat(Math.max(0, depth) * 4) + t);
      continue;
    }
    const { open, close, leadingClose } = braceDelta(t);
    const d = Math.max(0, depth - (leadingClose ? 1 : 0));
    let extra = 0;
    if (prevOpen === 'body') extra = 4;
    else if (prevOpen === 'cont' || /^\./.test(t)) extra = 8;
    out.push(' '.repeat(d * 4 + extra) + t);
    depth += open - close;
    const code = t.slice(0, commentStart(t) >= 0 ? commentStart(t) : t.length).trim();
    if (/^(if|for|while)\b.*\)$/.test(code) || /^else$/.test(code) || /^\}\s*else$/.test(code)) prevOpen = 'body';
    else if (code && !/[;{}]$/.test(code) && !/^@/.test(code)) prevOpen = 'cont';
    else prevOpen = '';
  }
  return out;
}

const MAX_CODE = 62;   // a statement longer than this keeps its comment right after it, so one long line does not push the whole column out

export function formatAndComment(code: string, addComments: boolean): string {
  if (!looksLikeJava(code)) return code;
  // 1) split "a; b;" lines and expand one-line if/for/while into braces
  const expanded: string[] = [];
  let inBlock = false;
  for (const l of code.split('\n')) {
    const t = l.trim();
    if (inBlock) { expanded.push(l); if (t.includes('*/')) inBlock = false; continue; }
    if (t.startsWith('/*') && !t.includes('*/')) { inBlock = true; expanded.push(l); continue; }
    if (!t || t.startsWith('//') || t.includes('"""')) { expanded.push(l); continue; }
    const lead = l.slice(0, l.length - l.trimStart().length);
    const pieces = splitStatements(t).flatMap(p => expandControl(p)).flatMap(p => (/^[@}\w]/.test(p) ? expandInline(p) : [p]));
    pieces.forEach(p => expanded.push(lead + p));
  }
  const lines = reindent(expanded);

  // 2) work out each line's code and comment (existing or generated)
  const kinds: Record<string, Kind> = {};
  for (const l of lines) {
    const d = l.trim().match(/^(?:final\s+)?([A-Z][\w]*(?:<[^=]*?>)?)\s+(\w+)\s*(?:=|;|:)/);
    if (d) kinds[d[2]] = kindOf(d[1]);
  }
  const ctx = { kinds, hasMain: /static\s+void\s+main/.test(code), classCount: { n: 0 } };
  type Row = { indent: string; code: string; comment: string | null; generated: boolean; raw?: string };
  const rows: Row[] = [];
  let blk = false, txt = false;
  for (const l of lines) {
    const t = l.trim();
    let skip = blk || txt;
    if (!blk && t.includes('/*') && !t.includes('*/')) { blk = true; skip = true; }
    else if (blk && t.includes('*/')) { blk = false; skip = true; }
    if (((t.match(/"""/g) ?? []).length) % 2 === 1) { txt = !txt; skip = true; }
    if (skip || !t || t.startsWith('//') || /\\$/.test(t)) { rows.push({ indent: '', code: '', comment: null, generated: false, raw: l }); continue; }
    const cs = commentStart(l);
    const indent = l.slice(0, l.length - l.trimStart().length);
    if (cs >= 0) rows.push({ indent, code: l.slice(0, cs).trim(), comment: l.slice(cs + 2).trim(), generated: false });
    else {
      const c = addComments ? commentLine(l, ctx) : null;
      rows.push({ indent, code: t, comment: c, generated: !!c });
    }
  }

  // 3) align the trailing comments of each paragraph into one column
  const out: string[] = [];
  let i = 0;
  while (i < rows.length) {
    if (rows[i].raw !== undefined) { out.push(rows[i].raw as string); i++; continue; }
    if (!rows[i].code) { out.push(''); i++; continue; }
    // collect the paragraph (until a blank/raw row)
    let j = i;
    while (j < rows.length && rows[j].raw === undefined && rows[j].code) j++;
    const group = rows.slice(i, j);
    const width = Math.max(0, ...group.filter(r => r.comment && (r.indent + r.code).length <= MAX_CODE).map(r => (r.indent + r.code).length));
    for (const r of group) {
      const left = r.indent + r.code;
      if (!r.comment) out.push(left);
      else if (left.length > MAX_CODE) out.push(left + '  // ' + r.comment);
      else out.push(left + ' '.repeat(width - left.length + 2) + '// ' + r.comment);
    }
    i = j;
  }
  return out.join('\n');
}

export function commentJava(code: string): string {
  return formatAndComment(code, true);
}
