// Core Java extras, part 12: looping statements (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java12Extras: Record<string, Extra> = {
    'Looping Statements': x(
        ['<b>Pick the loop</b> by the job: <code>for</code> when you can count, <code>while</code> when a condition decides, <code>do-while</code> when the body must run once.',
            '<b>Three parts</b> of a <code>for</code> loop: initialization, condition and update, as in <code>for (int i = 0; i &lt; 5; i++)</code>.',
            '<b>break and continue</b>: <code>break</code> leaves the loop and <code>continue</code> skips to the next iteration.'],
        ['<b>for-each</b> (<code>for (String s : list)</code>) avoids index errors, but it gives no index and you must not add or remove elements inside it.',
            '<b>Infinite loop</b>: <code>while (true)</code> or <code>for (;;)</code>; leave it with <code>break</code> or <code>return</code>.',
            '<b>Off-by-one</b>: array indexes run from 0 to <code>length - 1</code>.'],
        ['<b>Streams or loops</b>: use streams (<code>IntStream.range</code>, <code>filter</code>, <code>map</code>) for transformations, and plain loops for early exit and hot code.',
            '<b>Hoisting</b>: move work that does not change (method calls, <code>list.size()</code> on slow structures) out of the loop.',
            '<b>Safe removal</b>: use an iterator, because removing inside for-each throws <code>ConcurrentModificationException</code>.'],
        [['F', 'Name the loops in Java.', 'for, while, do-while and the enhanced for-each loop.'],
            ['F', 'Difference between while and do-while?', 'while checks the condition first; do-while runs the body once before checking.'],
            ['M', 'When use for-each?', 'When you only need to read each element and do not need the index.'],
            ['M', 'Why can for-each on a list throw ConcurrentModificationException?', 'Structurally modifying the list during iteration invalidates the iterator.'],
            ['S', 'How do you remove elements safely while iterating?', 'Use Iterator.remove() or Collection.removeIf.'],
            ['S', 'When is a stream better than a loop?', 'For declarative filter-map-collect pipelines; loops are better for early exit, mutation and tight performance code.']],
        [['The four loops.',
            r`for (int i = 1; i <= 3; i++) System.out.print(i + " ");
int n = 3;
while (n > 0) System.out.print(n-- + " ");
int k = 10;
do {
    System.out.print(k + " ");     // runs once although k < 10 is false
    k++;
} while (k < 10);
for (String s : List.of("a", "b")) System.out.print(s + " ");
System.out.println();

// OUTPUT:
// 1 2 3 3 2 1 10 a b`],
            ['Patterns: sum, factorial, table.',
                r`int sum = 0;
for (int i = 1; i <= 100; i++) sum += i;
long fact = 1;
for (int i = 2; i <= 10; i++) fact *= i;
for (int i = 1; i <= 3; i++) System.out.println("7 x " + i + " = " + 7 * i);
System.out.println(sum + " " + fact);

// OUTPUT:
// 7 x 1 = 7
// 7 x 2 = 14
// 7 x 3 = 21
// 5050 3628800`]],
        [['Safe removal.',
            r`List<Integer> l = new ArrayList<>(List.of(1, 2, 3, 4));
// WRONG: remove inside for-each throws ConcurrentModificationException
// for (int x : l) if (x % 2 == 0) l.remove((Integer) x);
Iterator<Integer> it = l.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) it.remove();   // RIGHT: remove via the iterator
}
System.out.println(l);

// OUTPUT:
// [1, 3]`],
            ['Nested loops: pattern.',
                r`for (int i = 1; i <= 4; i++) {
    for (int j = 1; j <= i; j++) System.out.print("*");
    System.out.println();
}

// OUTPUT:
// *
// **
// ***
// ****`]]
    )
};

export const java12Deep: Record<string, Deep> = {
    'Looping Statements': dv(
        [`<p>Loops compile to conditional jumps, and the JIT then tunes them.</p><ul><li><b>Bytecode:</b> a <code>for</code> becomes init, a condition check, the body and an update, then a backward <code>goto</code>.</li><li><b>JIT:</b> unrolls small loops, hoists invariants and removes bounds checks it can prove safe.</li><li><b>Vectorizing:</b> simple array loops use SIMD, and counted loops with an <code>int</code> counter are optimized best.</li><li><b>For-each:</b> over an array it is an index loop; over an <code>Iterable</code> it calls <code>iterator()</code>, <code>hasNext()</code> and <code>next()</code>.</li></ul>`,
            r`int[] a = new int[1_000_000];
long t = System.nanoTime();
for (int i = 0; i < a.length; i++) {
    a[i] = i * 2;          // counted loop: bounds checks removed, can vectorize
}
long sum = 0;
for (int v : a) sum += v;
System.out.println(sum + " ms=" + (System.nanoTime() - t) / 1_000_000);
// javap -c shows: for-each over an array is an index loop

// OUTPUT: (varies)
// 999999000000 ms=5`],
        [`<p>Choosing a loop style:</p><ul><li><b>Classic for:</b> when you need the index, a reverse walk or a step.</li><li><b>for-each:</b> for reading every element.</li><li><b>while:</b> for an unknown count, such as reading input or polling.</li><li><b>do-while:</b> for menus and retries.</li><li><b>Labeled break/continue:</b> for nested searches.</li><li><b>Iterator and ListIterator:</b> for removal and insertion.</li><li><b>entrySet():</b> to walk a map.</li><li><b>IntStream.range and iterate:</b> for functional pipelines.</li><li><b>Recursion:</b> also repeats work, but costs stack frames.</li></ul>`,
            r`Map<String, Integer> stock = new TreeMap<>(Map.of("pen", 5, "book", 0, "ink", 2));
for (Map.Entry<String, Integer> e : stock.entrySet()) {
    if (e.getValue() == 0) System.out.println("out of stock: " + e.getKey());
}
for (int i = 10; i > 0; i -= 3) System.out.print(i + " ");   // step of 3
System.out.println();
List<String> abc = new ArrayList<>(List.of("a", "b", "c"));
ListIterator<String> it = abc.listIterator(3);               // start at the end
while (it.hasPrevious()) System.out.print(it.previous());
System.out.println();
System.out.println(
    IntStream.iterate(1, n -> n <= 100, n -> n * 3).boxed().toList());
int[][] grid = {{1, 2}, {3, 4}};
search:
for (int[] row : grid) {
    for (int v : row) {
        if (v == 3) {
            System.out.println("found 3");
            break search;
        }
    }
}

// OUTPUT:
// out of stock: book
// 10 7 4 1
// cba
// [1, 3, 9, 27, 81]
// found 3`],
        [`<p>Common mistakes and the fix for each:</p><ul><li><b>Off-by-one:</b> <code>&lt;=</code> used instead of <code>&lt;</code>.</li><li><b>Loop variable changed in the body:</b> the count becomes hard to predict.</li><li><b>Infinite loop:</b> the condition never changes, or <code>continue</code> skips the update in a while loop.</li><li><b>Changing a collection while iterating:</b> use an iterator or <code>removeIf</code>.</li><li><b>LinkedList with get(i):</b> each call walks the chain, so the loop is quadratic.</li><li><b>Floating-point counter:</b> <code>for (double d = 0; d != 1; d += 0.1)</code> never ends, so use an integer counter.</li><li><b>Boxing:</b> an <code>Integer</code> counter allocates on every pass.</li><li><b>Swallowed exceptions:</b> an empty catch in the body hides real failures.</li></ul>`,
            r`int count = 0;
for (double d = 0; d != 1.0 && count < 15; d += 0.1) count++;
System.out.println("double loop ran " + count + " times (never hits 1.0)");
Integer boxedSum = 0;
long t = System.nanoTime();
for (int i = 0; i < 20_000_000; i++) {
    boxedSum += i;                 // boxing allocates on every pass
}
System.out.println("boxed ms=" + (System.nanoTime() - t) / 1_000_000);
List<Integer> ll =
    new LinkedList<>(IntStream.range(0, 20_000).boxed().toList());
t = System.nanoTime();
long s = 0;
for (int i = 0; i < ll.size(); i++) s += ll.get(i);          // O(n^2)
System.out.println("linked list indexed ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// double loop ran 15 times (never hits exactly 1.0)
// boxed ms=90
// linked list indexed ms=250`],
        [`<p>Algorithmic complexity (O(n) versus O(n^2)) matters far more than loop syntax. Replace nested searches with a <code>HashSet</code> or <code>HashMap</code>. Other tuning tips:</p><ul><li><b>Small bodies:</b> keep loop bodies small and free of allocation.</li><li><b>Hoisting:</b> compute <code>int n = list.size()</code> or any costly call once.</li><li><b>Memory order:</b> walk 2D arrays row by row.</li><li><b>Strings:</b> use <code>StringBuilder</code> instead of repeated concatenation.</li><li><b>Numbers:</b> use primitive loops or <code>IntStream</code>.</li><li><b>Branches:</b> keep them few inside hot loops.</li><li><b>Parallel:</b> use <code>parallelStream</code> only for independent, CPU-heavy work.</li></ul>`,
            r`int[] a = IntStream.range(0, 20_000).toArray();
int[] b = IntStream.range(10_000, 30_000).toArray();
long t = System.nanoTime();
int common = 0;
for (int x : a) {
    for (int y : b) {
        if (x == y) {
            common++;
            break;
        }  // O(n * m)
    }
}
long nested = System.nanoTime() - t;
Set<Integer> set = Arrays.stream(b).boxed().collect(Collectors.toSet());
t = System.nanoTime();
int common2 = 0;
for (int x : a) if (set.contains(x)) common2++;          // O(n + m)
long hashed = System.nanoTime() - t;
System.out.println((common == common2)
    + " nested ms=" + nested / 1_000_000 + " hashed ms=" + hashed / 1_000_000);

// OUTPUT: (varies)
// true nested ms=420 hashed ms=3`],
        [`<p>Loops that depend on an outside system must be bounded by a maximum number of attempts or a deadline. Typical real-world loops:</p><ul><li><b>Batch processing:</b> page through database rows in chunks until empty.</li><li><b>Retry:</b> backoff with a maximum.</li><li><b>Stream reading:</b> read until end of file.</li><li><b>Polling:</b> check a job status with a timeout.</li><li><b>Event loops:</b> games and servers.</li></ul>`,
            r`static <T> List<T> readAll(Function<Integer, List<T>> fetchPage) {
    List<T> all = new ArrayList<>();
    for (int page = 0; ; page++) {
        List<T> batch = fetchPage.apply(page);
        if (batch.isEmpty()) break;       // stop when the source is exhausted
        all.addAll(batch);
    }
    return all;
}

static boolean waitFor(BooleanSupplier ready, Duration timeout)
        throws InterruptedException {
    long deadline = System.nanoTime() + timeout.toNanos();
    while (System.nanoTime() < deadline) {
        if (ready.getAsBoolean()) return true;
        Thread.sleep(50);
    }
    return false;                         // bounded: never loops forever
}

// OUTPUT:
// all pages are read; the wait ends at the deadline even if the condition never becomes true`]
    )
};
