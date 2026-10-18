// Core Java extras, part 11: Java 21 features (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java11Extras: Record<string, Extra> = {
    'virtual-threads': x(
        ['<b>Virtual threads</b> (Java 21) are lightweight threads managed by the JVM, not the OS. You can run millions of them.',
            '<b>Create</b> one with <code>Thread.ofVirtual().start(runnable)</code>, <code>Thread.startVirtualThread(r)</code> or <code>Executors.newVirtualThreadPerTaskExecutor()</code>.',
            '<b>Simple code</b>: write plain blocking code (one thread per request) that scales like asynchronous code.'],
        ['<b>Unmounting</b>: when a virtual thread blocks on I/O, sleep or a lock, the JVM unmounts it from its carrier (platform) thread so the carrier runs other virtual threads.',
            '<b>No pooling</b>: create one per task; limit concurrency with a <code>Semaphore</code> if a resource is limited.',
            '<b>I/O-bound</b> work is the best fit; CPU-bound work gains nothing over platform threads.'],
        ['<b>Pinning</b>: avoid long <code>synchronized</code> blocks around blocking calls (pinning the carrier in Java 21); prefer <code>ReentrantLock</code>.',
            '<b><code>ThreadLocal</code></b> works but uses memory per thread; prefer scoped values or pass context explicitly.',
            '<b>Frameworks</b> (Spring Boot 3.2+, Tomcat, Jetty) can run requests on virtual threads with one configuration property.'],
        [['F', 'What is a virtual thread?', 'A lightweight thread scheduled by the JVM on a small pool of carrier threads, cheap enough to create in millions.'],
            ['F', 'How do you start one?', 'Thread.startVirtualThread(runnable) or an executor from Executors.newVirtualThreadPerTaskExecutor().'],
            ['M', 'Virtual vs platform threads?', 'Platform threads map one-to-one to OS threads (expensive); virtual threads are managed by the JVM and unmount while blocked.'],
            ['M', 'Should you pool virtual threads?', 'No, create a new one per task; pooling defeats their purpose. Use semaphores to limit concurrent access to resources.'],
            ['S', 'What is pinning?', 'A virtual thread stuck to its carrier because it blocks inside synchronized or a native call, reducing scalability.'],
            ['S', 'When do virtual threads not help?', 'For CPU-bound work, where the number of cores limits throughput.']],
        [['10,000 blocking tasks.',
            r`long t = System.nanoTime();
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<Integer>> fs = IntStream.range(0, 10_000)
        .mapToObj(i -> ex.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));   // blocking is cheap
            return i;
        })).toList();
    long sum = 0;
    for (var f : fs) sum += f.get();
    System.out.println(sum + " in " + (System.nanoTime() - t) / 1_000_000_000 + " s");
}

// OUTPUT: (about one second, not 10,000 seconds)
// 49995000 in 1 s`],
            ['Create and inspect.',
                r`Thread vt = Thread.ofVirtual().name("worker-", 1).start(() -> {
    Thread cur = Thread.currentThread();
    System.out.println(cur.getName() + " virtual=" + cur.isVirtual());
});
vt.join();

// OUTPUT:
// worker-1 virtual=true`]],
        [['Limit concurrency with a Semaphore.',
            r`Semaphore db = new Semaphore(10);       // only 10 concurrent database calls
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1000; i++) {
        ex.submit(() -> {
            db.acquire();
            try { queryDatabase(); } finally { db.release(); }
            return null;
        });
    }
}

// OUTPUT:
// 1000 tasks run, at most 10 query the database at once`],
            ['Spring Boot 3.2.',
                r`// application.properties
// spring.threads.virtual.enabled=true

// OUTPUT:
// each request is handled on a virtual thread`]]
    ),

    'record-patterns': x(
        ['<b>Deconstruction</b>: a record pattern (Java 21) splits a record in <code>instanceof</code> and <code>switch</code>, as in <code>if (o instanceof Point(int x, int y))</code>.',
            '<b>Binding</b>: the components go into variables in one step, so you do not call accessors.',
            '<b>Nesting</b>: patterns can contain patterns, as in <code>Line(Point(var x1, var y1), Point(var x2, var y2))</code>.'],
        ['<b>Type inference</b>: <code>var</code> in a pattern infers the component type.',
            '<b>Switch and guards</b>: use <code>case Circle(double r) -&gt; ...</code> and add conditions with <code>when</code>.',
            '<b>Matching rule</b>: a record pattern matches only if the value has the record type and the nested patterns match. A null value never matches.'],
        ['<b>Sealed types</b>: with sealed interfaces, record patterns give concise, exhaustive code. Visitors become switches.',
            '<b>Nested patterns</b>: they replace chains of accessor calls and null-unsafe navigation.',
            '<b>Generic records</b>: type arguments are inferred in patterns.'],
        [['F', 'What is a record pattern?', 'A pattern that tests for a record type and extracts its components into variables.'],
            ['F', 'Can record patterns be nested?', 'Yes, components can themselves be record patterns.'],
            ['M', 'Does a record pattern match null?', 'No; a null value never matches a record pattern.'],
            ['M', 'What does var do in a record pattern?', 'It infers the component type.'],
            ['S', 'How do record patterns relate to sealed types?', 'Together they allow exhaustive switches that deconstruct each variant.'],
            ['S', 'What replaces the visitor pattern here?', 'A switch over a sealed interface with record patterns in each case.']],
        [['Deconstruction in if and switch.',
            r`record Point(int x, int y) {}
record Line(Point from, Point to) {}
static String describe(Object o) {
    if (o instanceof Line(Point(var x1, var y1), Point(var x2, var y2))
            && x1 == x2) {
        return "vertical line at x=" + x1 + " length " + Math.abs(y2 - y1);
    }
    if (o instanceof Point(int x, int y)) return "point " + x + "," + y;
    return "unknown";
}
Line v = new Line(new Point(1, 1), new Point(1, 5));
System.out.println(describe(v) + " | " + describe(new Point(3, 4))
    + " | " + describe("x"));

// OUTPUT:
// vertical line at x=1 length 4 | point 3,4 | unknown`],
            ['Sealed + record patterns.',
                r`sealed interface Shape permits Circle, Rect {}
record Circle(double r) implements Shape {}
record Rect(double w, double h) implements Shape {}
static double area(Shape s) {
    return switch (s) {
        case Circle(double r) -> Math.PI * r * r;
        case Rect(double w, double h) when w == h -> w * w;
        case Rect(double w, double h) -> w * h;
    };
}
System.out.printf("%.2f %.1f %.1f%n",
    area(new Circle(1)), area(new Rect(2, 2)), area(new Rect(2, 3)));

// OUTPUT:
// 3.14 4.0 6.0`]],
        [['Null does not match.',
            r`Object o = null;
System.out.println(o instanceof Point(int x, int y));

// OUTPUT:
// false`],
            ['Generic record pattern.',
                r`record Box<T>(T value) {}
Object o = new Box<>("hello");
if (o instanceof Box<?>(String s)) System.out.println(s.toUpperCase());

// OUTPUT:
// HELLO`]]
    ),

    'switch-pattern': x(
        ['<b>Type pattern:</b> in Java 21 a <code>case</code> label can test a type: <code>case String s -&gt; ...</code>.',
            '<b>Guard:</b> add a condition with <code>when</code>: <code>case Integer i when i &gt; 10 -&gt; ...</code>.',
            '<b>Null and exhaustive:</b> match null with <code>case null</code>. The switch must cover every possible value.'],
        ['<b>Order matters:</b> put specific cases (with guards) before general ones, or the compiler reports a dominated label.',
            '<b>Sealed types, enums, records:</b> no <code>default</code> is needed when all subtypes are covered.',
            '<b>Selector type:</b> it can be any reference type, not just strings, enums and integers.'],
        ['<b>Replaces</b> long if-else instanceof chains and some visitor patterns.',
            '<b>Qualified enum constants</b> can be case labels in pattern switches (<code>case Color.RED</code>).',
            '<b>Sealed interfaces:</b> adding a subtype makes every non-exhaustive switch fail to compile.'],
        [['F', 'What is pattern matching for switch?', 'A switch whose case labels can test the type of the selector and bind a variable.'],
            ['F', 'What does when do?', 'It adds a boolean guard to a pattern case.'],
            ['M', 'Why does case order matter?', 'A general pattern before a specific one makes the specific one unreachable (dominated), which is a compile error.'],
            ['M', 'How is null handled?', 'A switch throws NullPointerException unless there is a case null (which can be combined with default).'],
            ['S', 'How does exhaustiveness work with sealed types?', 'If every permitted subtype is covered, no default is required, and adding a subtype makes the switch fail to compile.'],
            ['S', 'Compared with instanceof chains?', 'It is more readable, checked for exhaustiveness and compiled to an efficient type switch.']],
        [['Types, guards and null.',
            r`static String format(Object o) {
    return switch (o) {
        case null -> "null!";
        case Integer i when i < 0 -> "negative " + i;
        case Integer i -> "int " + i;
        case String s when s.isBlank() -> "blank";
        case String s -> "string " + s.length();
        case int[] a -> "int array of " + a.length;
        case List<?> l -> "list of " + l.size();
        default -> "other " + o.getClass().getSimpleName();
    };
}
System.out.println(format(null) + ", " + format(-5) + ", " + format("hey"));
System.out.println(format(new int[2]) + ", " + format(List.of(1)) + ", "
    + format(2.5));

// OUTPUT:
// null!, negative -5, string 3
// int array of 2, list of 1, other Double`],
            ['Exhaustive sealed switch.',
                r`sealed interface Event permits Login, Logout, Purchase {}
record Login(String user) implements Event {}
record Logout(String user) implements Event {}
record Purchase(String user, double amount) implements Event {}
static String audit(Event e) {
    return switch (e) {
        case Login l -> l.user() + " in";
        case Logout l -> l.user() + " out";
        case Purchase p when p.amount() > 1000 -> "LARGE " + p.user();
        case Purchase p -> p.user() + " bought";   // no default needed
    };
}
System.out.println(audit(new Purchase("abaji", 5000)) + " | "
    + audit(new Login("raoji")));

// OUTPUT:
// LARGE abaji | raoji in`]],
        [['Dominated label.',
            r`// switch (o) { case CharSequence cs -> "cs"; case String s -> "s"; default -> "x"; }
// error: this case label is dominated by a preceding case label (String is a CharSequence)

// OUTPUT:
// compile-time error`],
            ['NullPointerException.',
                r`String s = null;
try {
    switch (s) {
        case "a" -> System.out.println("a");
        default -> System.out.println("d");
    }
} catch (NullPointerException e) {
    System.out.println("NPE without case null");
}

// OUTPUT:
// NPE without case null`]]
    ),

    'sequenced-collections': x(
        ['<b>Sequenced collections</b> (Java 21) give ordered collections one common API: first, last, add at the ends and a reversed view.',
            '<b>New interfaces</b>: <code>SequencedCollection</code>, <code>SequencedSet</code>, <code>SequencedMap</code>. They are implemented by <code>List</code>, <code>Deque</code>, <code>LinkedHashSet</code>, <code>LinkedHashMap</code>, <code>TreeSet</code> and <code>TreeMap</code>.',
            '<b>Methods</b>: <code>getFirst()</code>, <code>getLast()</code>, <code>addFirst</code>, <code>addLast</code>, <code>removeFirst</code>, <code>removeLast</code>, <code>reversed()</code>.'],
        ['<b>Live view</b>: <code>reversed()</code> returns a view in reverse order, and changes show through both ways.',
            '<b>Old way</b>: before Java 21 you wrote <code>list.get(list.size() - 1)</code>, with different code for each collection type.',
            '<b>Map methods</b>: <code>SequencedMap</code> adds <code>firstEntry</code>, <code>lastEntry</code>, <code>pollFirstEntry</code>, <code>putFirst</code>, <code>putLast</code> and <code>sequencedKeySet</code>.'],
        ['<b>Empty collection</b>: <code>getFirst()</code> on an empty list throws <code>NoSuchElementException</code>, so check for emptiness.',
            '<b>Immutable lists</b>: <code>List.of</code> lists are sequenced, but the changing methods throw <code>UnsupportedOperationException</code>.',
            '<b>Not sequenced</b>: <code>HashSet</code> and <code>HashMap</code> have no defined order.'],
        [['F', 'What are sequenced collections?', 'Collections with a defined order that share methods to access and modify the first and last elements and to reverse them.'],
            ['F', 'Which methods do they add?', 'getFirst, getLast, addFirst, addLast, removeFirst, removeLast and reversed.'],
            ['M', 'Is reversed() a copy?', 'No, it is a view: changes to one are visible in the other.'],
            ['M', 'Is HashSet a SequencedSet?', 'No, it has no defined order.'],
            ['S', 'What problem did this solve?', 'Inconsistent APIs for first and last elements across List, Deque, LinkedHashSet and SortedSet.'],
            ['S', 'What happens on getFirst of an empty list?', 'NoSuchElementException.']],
        [['Uniform API.',
            r`List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
LinkedHashSet<String> set = new LinkedHashSet<>(List.of("a", "b", "c"));
Deque<Integer> dq = new ArrayDeque<>(List.of(7, 8, 9));
System.out.println(list.getFirst() + " " + list.getLast() + " "
    + set.getFirst() + " " + set.reversed() + " " + dq.reversed());
list.addFirst(0);
list.removeLast();
System.out.println(list + " " + list.reversed());

// OUTPUT:
// 1 3 a [c, b, a] [9, 8, 7]
// [0, 1, 2] [2, 1, 0]`],
            ['SequencedMap.',
                r`SequencedMap<String, Integer> m = new LinkedHashMap<>();
m.put("b", 2);
m.put("c", 3);
m.putFirst("a", 1);
System.out.println(m + " " + m.firstEntry() + " " + m.lastEntry()
    + " " + m.reversed());
System.out.println(m.pollLastEntry() + " " + m.sequencedKeySet());

// OUTPUT:
// {a=1, b=2, c=3} a=1 c=3 {c=3, b=2, a=1}
// c=3 [a, b]`]],
        [['View semantics.',
            r`List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
List<Integer> rev = l.reversed();
l.add(4);   // rev is now [4, 3, 2, 1]
rev.add(0); // end of rev = start of l
System.out.println(rev + " " + l);

// OUTPUT:
// [4, 3, 2, 1, 0] [0, 1, 2, 3, 4]`],
            ['Empty collection.',
                r`try {
    new ArrayList<String>().getFirst();
} catch (NoSuchElementException e) {
    System.out.println("empty list");
}

// OUTPUT:
// empty list`]]
    ),

    'string-templates': x(
        ['<b>String templates</b> (Java 21 preview) embed expressions in strings: <code>STR."Hello \\{name}!"</code>.',
            'The <b>processor</b> <code>STR</code> is built in and interpolates; others (<code>FMT</code>, <code>RAW</code>) format or defer, and you can write your own.',
            '<b>Preview feature:</b> in Java 21 and 22 you compile and run with <code>--enable-preview</code>. It was removed in JDK 23, so it does not compile on current JDKs. Use <code>formatted</code> instead.'],
        ['<b>Expressions</b> inside <code>\\{ }</code> can be any Java expression, including method calls and ternaries.',
            '<b>Text blocks</b> work with templates for multi-line output.',
            '<b>FMT</b> uses printf-style specifiers, for example <code>FMT."%05d\\{n}"</code>.'],
        ['<b>Custom processors</b> can validate and transform parts safely, for example producing a <code>PreparedStatement</code> or escaped HTML instead of a raw string, which prevents injection.',
            '<b>Production use:</b> the feature changed during preview and was then withdrawn; <code>String.format</code> and <code>formatted</code> remain the stable tools.',
            '<b>Core idea:</b> interpolation with safety hooks. Learn it, but do not depend on it.'],
        [['F', 'What is a string template?', 'A string with embedded expressions that a template processor combines into a result.'],
            ['F', 'How do you enable the preview in Java 21?', 'Compile and run with --enable-preview and --release 21.'],
            ['M', 'What does STR do?', 'It is the standard processor that interpolates the expression values into the string.'],
            ['M', 'Why can templates be safer than concatenation?', 'A custom processor can validate or escape the embedded values, such as building a safe SQL statement.'],
            ['S', 'Why avoid string templates in production today?', 'It is a preview API that changed and was withdrawn for redesign, so use String.format, formatted or text blocks.'],
            ['S', 'What are the stable alternatives?', 'String.format, String.formatted, text blocks and StringBuilder.']],
        [['Preview syntax (Java 21).',
            r`// javac --enable-preview --release 21 Main.java    java --enable-preview Main
String name = "Abaji";
int a = 3, b = 4;
String s1 = STR."Hello \{name}!";
String s2 = STR."\{a} + \{b} = \{a + b}";
String json = STR."""
    { "user": "\{name}", "sum": \{a + b} }
    """;
System.out.println(s1 + " | " + s2);

// OUTPUT:
// Hello Abaji! | 3 + 4 = 7`],
            ['Stable alternatives.',
                r`String name = "Abaji";
int a = 3, b = 4;
String s1 = "Hello %s!".formatted(name);
String s2 = String.format("%d + %d = %d", a, b, a + b);
System.out.println(s1 + " | " + s2);
String json = """
    { "user": "%s", "sum": %d }
    """.formatted(name, a + b);
System.out.print(json);

// OUTPUT:
// Hello Abaji! | 3 + 4 = 7
// { "user": "Abaji", "sum": 7 }`]],
        [['Injection with plain concatenation.',
            r`String user = "x' OR '1'='1";
String bad = "SELECT * FROM users WHERE name = '" + user + "'";       // injectable
// use a PreparedStatement:   ps = conn.prepareStatement("SELECT * FROM users WHERE name = ?"); ps.setString(1, user);

// OUTPUT:
// never build SQL by interpolating user input`],
            ['Use a stable method today.',
                r`record Order(String id, double total) {}
Order o = new Order("A1", 99.5);
System.out.println("Order %s total %.2f".formatted(o.id(), o.total()));

// OUTPUT:
// Order A1 total 99.50`]]
    )
};

export const java11Deep: Record<string, Deep> = {
    'virtual-threads': dv(
        [`A virtual thread is a <code>java.lang.Thread</code> whose stack is stored in the heap as stack-chunk objects. The scheduler is a <code>ForkJoinPool</code> of carrier threads (default size = cores). On a blocking call (socket read, <code>sleep</code>, <code>LockSupport.park</code>, <code>ReentrantLock</code>) the JVM unmounts the virtual thread, copying its frames to the heap, and the carrier runs another one; when the operation completes the thread is rescheduled and remounted. Blocking in <code>synchronized</code> or native frames pins the carrier (Java 21; improved in later releases).`,
            r`Thread vt = Thread.ofVirtual().unstarted(() -> {
    System.out.println("before: " + Thread.currentThread());
    try { Thread.sleep(100); } catch (InterruptedException e) {}
    System.out.println("after:  " + Thread.currentThread());   // maybe another carrier
});
vt.start();
vt.join();
System.out.println(vt.isDaemon() + " " + vt.getThreadGroup().getName());

// OUTPUT: (carrier ids vary)
// before: VirtualThread[#21]/runnable@ForkJoinPool-1-worker-1
// after:  VirtualThread[#21]/runnable@ForkJoinPool-1-worker-3
// true VirtualThreads`],
        [`The programming model is simple: one thread per task, no pools, plain blocking code. Use <code>try-with-resources</code> on the executor so it waits for all tasks. For related subtasks, <code>StructuredTaskScope</code> (preview in Java 21) forks them together and cancels the rest if one fails. Use scoped values (preview) instead of <code>ThreadLocal</code>. Diagnose with <code>jcmd Thread.dump_to_file -format=json</code> and the JFR event <code>jdk.VirtualThreadPinned</code>.`,
            r`record Page(String user, List<String> orders) {}
static Page load(String id) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) { // preview in 21
        var user = scope.fork(() -> fetchUser(id));
        var orders = scope.fork(() -> fetchOrders(id));
        scope.join().throwIfFailed();      // wait; rethrow the first failure
        return new Page(user.get(), orders.get());
    }
}
// run with: java --enable-preview ...
// thread dump: jcmd <pid> Thread.dump_to_file -format=json dump.json

// OUTPUT:
// subtasks run in parallel on virtual threads; one failure cancels the other`],
        [`Common mistakes and their fixes. Do not pool virtual threads. Do not use them for CPU-bound loops. Do not let unlimited threads hit one database: limit with a semaphore or connection pool. Avoid heavy <code>ThreadLocal</code> caches, because millions of threads multiply them. Priority and daemon status are fixed, so do not rely on them. On Java 21, replace a <code>synchronized</code> block that wraps I/O with <code>ReentrantLock</code>.`,
            r`// Mistake: a pool sized for platform threads (legacy habit)
ExecutorService pool = Executors.newFixedThreadPool(200);
// Fix: one virtual thread per task, no pool
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) { /* submit tasks */ }

// Mistake: sleeping inside synchronized pins the carrier on Java 21
Object lock = new Object();
Runnable pinned = () -> {
    synchronized (lock) {
        try { Thread.sleep(1000); } catch (InterruptedException e) {}
    }
};
// Fix: ReentrantLock lets the thread unmount while it waits
ReentrantLock rl = new ReentrantLock();
Runnable friendly = () -> {
    rl.lock();
    try { Thread.sleep(1000); } catch (InterruptedException e) {}
    finally { rl.unlock(); }
};

// OUTPUT:
// -Djdk.tracePinnedThreads=full prints stack traces where pinning occurs`],
        [`Little's Law says concurrency = rate x latency. Virtual threads let you hold 100,000 or more waiting tasks at once. They do not make code faster. They only remove the thread-count ceiling. Each one costs only its live stack (a few KB). The real limits become downstream resources such as DB connections and rate limits, so protect them explicitly. Measure with a load test.`,
            r`// 100,000 concurrent HTTP calls each waiting 200 ms:
// platform threads (200 pool): 100000 / 200 x 0.2 s = 100 s
// virtual threads:             about 0.2 s plus overhead (limited by remote capacity)
int tasks = 100_000;
long t = System.nanoTime();
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, tasks).forEach(i -> ex.submit(() -> {
        Thread.sleep(Duration.ofMillis(200));   // simulated remote call
        return i;
    }));
}
System.out.println((System.nanoTime() - t) / 1_000_000 + " ms");

// OUTPUT: (varies)
// 1500 ms`],
        [`A web service calls two backends per request. With virtual threads each request is plain blocking code. A semaphore protects the payment gateway, and Spring Boot turns virtual threads on with one property.`,
            r`// application.properties:  spring.threads.virtual.enabled=true
@RestController class ProfileController {
    private final Semaphore gatewayLimit = new Semaphore(50);

    @GetMapping("/profile/{id}")
    Profile get(@PathVariable String id) throws Exception {
        var user = users.fetch(id);            // blocking call: fine
        gatewayLimit.acquire();                // at most 50 gateway calls at once
        try {
            return new Profile(user, gateway.score(id));
        } finally {
            gatewayLimit.release();
        }
    }
}

// OUTPUT:
// simple blocking code serving tens of thousands of concurrent requests`]
    ),

    'record-patterns': dv(
        [`Record patterns compile to calls of the record's accessor methods after a type test, with nested patterns tested recursively; if an accessor throws, the exception is wrapped in <code>MatchException</code>. The compiler checks that patterns are exhaustive for sealed record hierarchies, including nested ones: all combinations of component types must be covered.`,
            r`sealed interface Pair permits Same, Diff {}
record Same(int v) implements Pair {}
record Diff(int a, int b) implements Pair {}
record Holder(Pair p, boolean flag) {}
static String f(Holder h) {
    return switch (h) {
        case Holder(Same(var v), true) -> "same+flag " + v;
        case Holder(Same(var v), false) -> "same " + v;
        case Holder(Diff(var a, var b), var flag) -> "diff " + a + "," + b + (flag ? "!" : "");
    };
}
System.out.println(f(new Holder(new Same(1), true)) + " | " + f(new Holder(new Diff(2, 3), true)));

// OUTPUT:
// same+flag 1 | diff 2,3!`],
        [`<p>Common uses:</p>
<ul>
<li><b>Interpreters and compilers</b>: evaluate an expression tree (AST).</li>
<li><b>Transformations</b>: simplify expressions.</li>
<li><b>Routing</b>: match on command records.</li>
<li><b>Validation</b>: nested checks on data.</li>
<li><b>Tuples</b>: generic records such as <code>Pair&lt;A,B&gt;</code>.</li>
<li><b>Visitor replacement</b>: a switch instead of visitor classes.</li>
</ul>
<p>Combine them with guards (<code>when</code>) and <code>var</code> for brevity. Unnamed patterns (<code>_</code>, final in Java 22) ignore components you do not need.</p>`,
            r`sealed interface Expr permits Const, Add, Mul, Neg {}
record Const(int v) implements Expr {}
record Add(Expr l, Expr r) implements Expr {}
record Mul(Expr l, Expr r) implements Expr {}
record Neg(Expr e) implements Expr {}
static Expr simplify(Expr e) {
    return switch (e) {
        case Add(Const(var a), Const(var b)) -> new Const(a + b);
        case Add(var l, Const(var z)) when z == 0 -> simplify(l);
        case Mul(var l, Const(var one)) when one == 1 -> simplify(l);
        case Mul(Const(var zero), var r) when zero == 0 -> new Const(0);
        case Neg(Neg(var inner)) -> simplify(inner);
        case Add(var l, var r) -> new Add(simplify(l), simplify(r));
        case Mul(var l, var r) -> new Mul(simplify(l), simplify(r));
        case Neg(var x) -> new Neg(simplify(x));
        case Const c -> c;
    };
}
Expr e = new Add(new Mul(new Const(5), new Const(1)), new Const(0));
System.out.println(simplify(e));

// OUTPUT:
// Const[v=5]`],
        [`<p>Mistakes to avoid:</p>
<ul>
<li>Forgetting that a custom accessor runs during matching.</li>
<li>Expecting a nested type pattern to match a null component. Only a total pattern, such as <code>var</code>, matches null.</li>
<li>Using patterns on non-record classes (not supported).</li>
<li>Writing huge nested patterns that are hard to read.</li>
<li>Relying on the order of accessors that have side effects.</li>
<li>Not covering every nested combination (compile error with sealed types).</li>
</ul>`,
            r`record Box(Object o) {}
Object b = new Box(null);
// total pattern: matches a null component
System.out.println(b instanceof Box(Object o));
// type pattern: does not match null
System.out.println(b instanceof Box(String s));
record Weird(int v) {
    public int v() { throw new IllegalStateException("accessor failed"); }
}
try {
    if (new Weird(1) instanceof Weird(int v)) { }
} catch (MatchException e) {
    System.out.println("MatchException: " + e.getCause().getMessage());
}

// OUTPUT:
// true
// false
// MatchException: accessor failed`],
        [`Compiled record patterns are efficient: type checks plus accessor calls, with no reflection. The switch dispatch for a sealed hierarchy uses a type switch with a cached call site. The cost is similar to hand-written instanceof chains but with exhaustiveness guarantees.`,
            r`// javap -c -p Main shows invokedynamic SwitchBootstraps.typeSwitch and direct accessor invocations (no reflection)

// OUTPUT:
// same cost as handwritten instanceof plus accessor calls`],
        [`Real-world: handling domain events and commands as records and switching over them. New event types force every handler switch to be updated by the compiler.`,
            r`sealed interface Command permits Deposit, Withdraw, Transfer {}
record Deposit(String acct, long cents) implements Command {}
record Withdraw(String acct, long cents) implements Command {}
record Transfer(String from, String to, long cents) implements Command {}
void handle(Command c) {
    switch (c) {
        case Deposit(var acct, var cents) -> ledger.credit(acct, cents);
        case Withdraw(var acct, var cents) -> ledger.debit(acct, cents);
        case Transfer(var from, var to, var cents) -> {
            ledger.debit(from, cents);
            ledger.credit(to, cents);
        }
    }
}

// OUTPUT:
// adding a new Command variant breaks compilation here until it is handled`]
    ),

    'switch-pattern': dv(
        [`A pattern switch compiles to an <code>invokedynamic</code> call to <code>SwitchBootstraps.typeSwitch</code>. It returns the index of the first matching case, and is called again with a restart index when a guard fails.<ul><li><b>Dominance:</b> a label is dominated if an earlier label matches every value it could match, such as an unguarded general type before a specific one.</li><li><b>Exhaustiveness:</b> every possible value must be covered. For sealed hierarchies that means all permitted subtypes. Otherwise add a <code>default</code> or a total pattern.</li><li><b>Null:</b> a null selector throws <code>NullPointerException</code> unless <code>case null</code> exists.</li></ul>`,
            r`static String f(Object o) {
    return switch (o) {
        case String s when s.length() > 3 -> "long string";
        case String s -> "short string";
        case Number n when n.intValue() > 100 -> "big number";
        case Number n -> "number";
        case null, default -> "something else or null";
    };
}
System.out.println(f("hello") + ", " + f("hi") + ", " + f(500));
System.out.println(f(7.5) + ", " + f(null) + ", " + f('c'));

// OUTPUT:
// long string, short string, big number
// number, something else or null, something else or null`],
        [`Syntax options you can combine:<ul><li>Qualified enum constants mixed with patterns (<code>case Status.ACTIVE</code>), including sealed interfaces that enums implement.</li><li>Generic sealed hierarchies such as <code>Result&lt;T&gt;</code>, and nested record patterns.</li><li><code>yield</code> inside block cases.</li></ul>A sealed hierarchy plus a pattern switch can replace the Visitor pattern. You get the same exhaustiveness with far less code.`,
            r`sealed interface Result<T> permits Ok, Failure {}
record Ok<T>(T value) implements Result<T> {}
record Failure<T>(String error, int code) implements Result<T> {}
static <T> String render(Result<T> r) {
    return switch (r) {
        case Ok<T>(var v) -> "OK: " + v;
        case Failure<T>(var e, var code) when code >= 500
            -> "SERVER ERROR " + code + ": " + e;
        case Failure<T>(var e, var code) -> "ERROR " + code + ": " + e;
    };
}
System.out.println(render(new Ok<>(42)) + " | "
    + render(new Failure<Integer>("boom", 503)) + " | "
    + render(new Failure<Integer>("bad input", 400)));

// An enum can implement a sealed interface
sealed interface Token permits Color2, Word {}
enum Color2 implements Token { BLUE }
record Word(String w) implements Token {}
static String tok(Token t) {
    return switch (t) {
        case Color2.BLUE -> "blue";
        case Word(var w) -> "word " + w;
    };
}
System.out.println(tok(Color2.BLUE) + " " + tok(new Word("x")));

// OUTPUT:
// OK: 42 | SERVER ERROR 503: boom | ERROR 400: bad input
// blue word x`],
        [`Common mistakes:<ul><li>A general pattern placed before a specific one (dominance error).</li><li>A <code>default</code> on a sealed type, which turns off exhaustiveness checks.</li><li>Forgetting <code>case null</code> when null is possible (NPE).</li><li>Guards with side effects, because guards may be evaluated again in an unexpected order.</li><li>Using patterns where a polymorphic method is simpler.</li><li>Expecting fall-through: a pattern case cannot fall into another case that has bindings.</li></ul>`,
            r`static String bad(Object o) {
    return switch (o) {
        case Object x -> "any";        // total pattern first
        // case String s -> "string";  // compile error: label is dominated
    };
}
// default hides missing variants:
// switch (shape) { case Circle c -> ...; default -> ... }
// a new Square variant silently goes to default

// OUTPUT:
// the String case does not compile: a total pattern must come last`],
        [`The type switch call site can cache the last match and the JIT can inline it. For a few cases it is about as fast as an instanceof chain, and for many cases it can scale better. Guards run in order, so keep them cheap. Avoid allocating objects inside patterns in hot paths.`,
            r`// Rule of thumb (measure with JMH on your own data):
// virtual method call <= pattern switch ~ instanceof chain
// keep hot behavior as methods when you own the types
// use a switch for closed data (sealed types)

// OUTPUT:
// differences are small; choose for clarity`],
        [`Real-world uses: an API client mapping responses of different shapes, a rules engine, and a compiler front end. Exhaustive switches over sealed types act as compile-time checklists when new variants arrive.`,
            r`// imports needed: java.time.Duration, java.util.NoSuchElementException
sealed interface ApiResponse
    permits Success, NotFound, RateLimited, ServerError {}
record Success(String body) implements ApiResponse {}
record NotFound(String path) implements ApiResponse {}
record RateLimited(Duration retryAfter) implements ApiResponse {}
record ServerError(int status, String body) implements ApiResponse {}
// retry() is a helper that calls the API again
String handle(ApiResponse r) throws InterruptedException {
    return switch (r) {
        case Success(var b) -> b;
        case NotFound(var p) -> throw new NoSuchElementException(p);
        case RateLimited(var wait) -> { Thread.sleep(wait); yield retry(); }
        case ServerError(var s, var b) when s == 503 -> retry();
        case ServerError(var s, var b) -> throw new IllegalStateException("server " + s);
    };
}

// OUTPUT:
// every response variant is handled; a new one will not compile until added`]
    ),

    'sequenced-collections': dv(
        [`JEP 431 added three new interfaces and retrofitted the existing collections to use them:
<ul>
<li><code>SequencedCollection&lt;E&gt;</code> extends Collection and holds <code>reversed</code>, <code>addFirst</code>/<code>addLast</code>, <code>getFirst</code>/<code>getLast</code> and <code>removeFirst</code>/<code>removeLast</code>.</li>
<li><code>SequencedSet</code> and <code>SequencedMap</code> are the Set and Map versions.</li>
<li><code>List</code>, <code>Deque</code>, <code>LinkedHashSet</code> and <code>SortedSet</code>/<code>NavigableSet</code> are sequenced collections.</li>
<li><code>LinkedHashMap</code> and <code>SortedMap</code>/<code>NavigableMap</code> are sequenced maps.</li>
<li><code>reversed()</code> returns a view, and the reversed view of an immutable collection is also immutable.</li>
</ul>`,
            r`SequencedCollection<String> sc = new ArrayDeque<>(List.of("a", "b", "c"));
System.out.println(sc.getFirst() + sc.getLast() + " " + sc.reversed());
NavigableSet<Integer> ts = new TreeSet<>(List.of(3, 1, 2));
System.out.println(ts.getFirst() + " " + ts.reversed()
    + " " + (ts instanceof SequencedSet<Integer>));
try {
    ts.addFirst(0);
} catch (UnsupportedOperationException e) {
    System.out.println("sorted sets cannot addFirst (comparator sets order)");
}
List<Integer> imm = List.of(1, 2, 3);
try {
    imm.reversed().add(4);
} catch (UnsupportedOperationException e) {
    System.out.println("immutable view");
}

// OUTPUT:
// ac [c, b, a]
// 1 [3, 2, 1] true
// sorted sets cannot addFirst (comparator sets order)
// immutable view`],
        [`Common use cases:
<ul>
<li>LRU caches (<code>LinkedHashMap</code> with <code>pollFirstEntry</code>), history (last N items), playlists and undo stacks.</li>
<li>Reverse loops without copying: <code>for (var x : list.reversed())</code>.</li>
<li>Streams over a reversed view: <code>list.reversed().stream()</code>.</li>
<li>Utility code that works on any ordered collection.</li>
<li><code>LinkedHashMap.putFirst</code> and <code>putLast</code> move entries to the ends.</li>
</ul>
<p>Before Java 21, <code>Collections.reverse</code> changed the list itself, so you needed <code>new ArrayList(list)</code> copies.</p>`,
            r`static <T> List<T> lastN(SequencedCollection<T> c, int n) {
    return c.reversed().stream().limit(n).toList().reversed();
}
System.out.println(lastN(new ArrayList<>(List.of(1, 2, 3, 4, 5)), 3));
for (String s : new ArrayList<>(List.of("x", "y", "z")).reversed())
    System.out.print(s);
System.out.println();
SequencedMap<String, Integer> lru = new LinkedHashMap<>();
lru.put("a", 1);
lru.put("b", 2);
lru.put("c", 3);
lru.putLast("a", 1);               // mark 'a' as most recently used
var eldest = lru.pollFirstEntry(); // evict least recently used
System.out.println(eldest + " " + lru);

// OUTPUT:
// [3, 4, 5]
// zyx
// b=2 {c=3, a=1}`],
        [`Common mistakes:
<ul>
<li>Assuming <code>HashSet</code> or <code>HashMap</code> are sequenced.</li>
<li>Calling <code>getFirst</code> on an empty collection without a check.</li>
<li>Changing a collection while looping over its reversed view.</li>
<li>Expecting <code>reversed()</code> to be a copy (use <code>new ArrayList&lt;&gt;(list.reversed())</code> for a copy).</li>
<li>Calling <code>addFirst</code> on a sorted set, which is unsupported.</li>
<li>Writing your own collection with a <code>reversed()</code> or <code>getFirst()</code> that has a different return type: it fails to compile on Java 21.</li>
</ul>`,
            r`Set<Integer> hs = new HashSet<>(List.of(1, 2, 3));
System.out.println(hs instanceof SequencedCollection<Integer>);
List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
List<Integer> view = l.reversed();
l.set(0, 99);
System.out.println(view);
List<Integer> copy = new ArrayList<>(l.reversed());
l.set(1, 77);
System.out.println(copy + " " + view);

// OUTPUT:
// false
// [3, 2, 99]
// [3, 2, 99] [3, 77, 99]`],
        [`<ul>
<li><code>reversed()</code> on <code>ArrayList</code> is an O(1) view, and looping through it costs the same as a normal loop.</li>
<li>Reversed views of <code>LinkedList</code> and <code>ArrayDeque</code> are also cheap.</li>
<li><code>getFirst</code>/<code>getLast</code> are O(1) for lists and deques.</li>
<li>Prefer views to copying for large lists.</li>
</ul>`,
            r`List<Integer> big = IntStream.range(0, 5_000_000).boxed()
    .collect(Collectors.toCollection(ArrayList::new));
long t = System.nanoTime();
var v = big.reversed();
long s = 0;
for (int x : v) s += x;
long viewMs = (System.nanoTime() - t) / 1_000_000;
t = System.nanoTime();
var copy = new ArrayList<>(big);
Collections.reverse(copy);
for (int x : copy) s += x;
long copyMs = (System.nanoTime() - t) / 1_000_000;
System.out.println("view ms=" + viewMs + " copy+reverse ms=" + copyMs);

// OUTPUT: (varies)
// view ms=25 copy+reverse ms=60`],
        [`Real-world: showing the most recent activity first, and implementing an LRU cache or bounded history with first and last operations.`,
            r`Deque<String> history = new ArrayDeque<>();
void visit(String url) {
    history.addLast(url);
    if (history.size() > 50) history.removeFirst(); // keep last 50
}
List<String> recentFirst() {
    return new ArrayList<>(history.reversed());
}
visit("/home");
visit("/orders");
visit("/profile");
System.out.println(recentFirst());

// OUTPUT:
// [/profile, /orders, /home]`]
    ),

    'string-templates': dv(
        [`A string template (JEP 430, preview in Java 21 and 22) is a <code>StringTemplate</code> value made of fragments and values; a <i>template processor</i> (an object with <code>process</code>) turns it into a result of any type. <code>STR</code> is imported implicitly and interpolates; <code>FMT</code> adds format specifiers; <code>RAW</code> returns the template unprocessed. The syntax uses <code>\\{expr}</code> inside a string or text block. Because it is a preview, it requires <code>--enable-preview</code>, and the feature was withdrawn after Java 22 for a redesign, so APIs and syntax may change.`,
            r`// javac --enable-preview --release 21 App.java   (Java 21 / 22 only)
int x = 10, y = 20;
String a = STR."\{x} + \{y} = \{x + y}";
String b = STR."max=\{Math.max(x, y)}, even=\{x % 2 == 0 ? "yes" : "no"}";
StringTemplate raw = StringTemplate.RAW."v=\{x}";
System.out.println(a + " | " + b);
System.out.println(raw.fragments() + " " + raw.values());

// OUTPUT:
// 10 + 20 = 30 | max=20, even=yes
// [v=, ] [10]`],
        [`Why it existed: interpolation that is safe by design. A processor receives the fixed fragments and the embedded values separately, so it can escape or bind values rather than splice them: JSON building, SQL (<code>PreparedStatement</code>), HTML escaping, localization. Custom processors: <code>StringTemplate.Processor.of(...)</code>. Because the language design changed, production code should use stable approaches: <code>String.format</code>, <code>formatted</code>, text blocks, <code>MessageFormat</code> and prepared statements.`,
            r`// Preview-era idea (do not use in production):
// var DB = new QueryProcessor(connection);
// ResultSet rs = DB."SELECT * FROM users WHERE name = \{userName}";
// (userName would be bound as a parameter, not concatenated)

// Stable approach today:
String userName = "x' OR '1'='1";
String sql = "SELECT * FROM users WHERE name = ?";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, userName);              // bound as data
    try (ResultSet rs = ps.executeQuery()) {
        /* read rows */
    }
}

// OUTPUT:
// the malicious text is treated as data, never as SQL`],
        [`Mistakes: using a preview feature in production, forgetting <code>--enable-preview</code> at both compile and run time (class file version marks preview), building SQL, HTML or shell commands by interpolation (injection), and assuming the syntax will not change. Pin preview use to experiments and keep stable code on <code>formatted</code> and prepared statements.`,
            r`// Class files compiled with preview features cannot run without --enable-preview:
// UnsupportedClassVersionError: Preview features are not enabled for App
//   (class file version 65.65535)
String user = "<script>alert(1)</script>";
String html = "<p>" + user + "</p>";        // XSS if inserted unescaped
String esc = user.replace("&", "&amp;")
                 .replace("<", "&lt;")
                 .replace(">", "&gt;");
String safe = "<p>" + esc + "</p>";
System.out.println(safe);

// OUTPUT:
// <p>&lt;script&gt;alert(1)&lt;/script&gt;</p>`],
        [`Interpolation performance is comparable to <code>StringBuilder</code>/<code>String.format</code> alternatives: processors can be optimized by <code>invokedynamic</code>. Avoid expensive expressions inside templates evaluated in logging statements when the log level is disabled; use lazy logging with suppliers or placeholders.`,
            r`// built only if DEBUG is enabled
log.debug("order {} total {}", order.id(), order.total());
// guard expensive work
if (log.isDebugEnabled()) log.debug("details " + expensiveDump(order));

// OUTPUT:
// no formatting cost when the level is disabled`],
        [`Real-world: until the redesigned feature ships, use text blocks with <code>formatted</code> for emails and reports, <code>MessageFormat</code> or ICU for localized messages, and template engines (Thymeleaf, Mustache) for HTML.`,
            r`String body = """
    Hello %s,

    Your order %s for %,.2f was shipped on %s.
    """.formatted(customer.name(), order.id(), order.total(),
                 shippedOn.format(fmt));      // fmt = DateTimeFormatter.ofPattern("dd MMM yyyy")
mailer.send(customer.email(), "Order shipped", body);

// OUTPUT:
// a readable, localized message built with stable APIs`]
    )
};
