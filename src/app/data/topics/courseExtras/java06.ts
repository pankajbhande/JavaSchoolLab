// Core Java extras, part 6: concurrency utilities and exceptions (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java06Extras: Record<string, Extra> = {
    'executor-framework': x(
        ['<b>Core idea</b>: submitting a task is separate from running it. Create an <code>ExecutorService</code> with <code>Executors</code> and submit <code>Runnable</code> or <code>Callable</code> tasks.',
            '<b>Common pools</b>: <code>newFixedThreadPool(n)</code>, <code>newCachedThreadPool()</code>, <code>newSingleThreadExecutor()</code>, <code>newScheduledThreadPool(n)</code>, <code>newVirtualThreadPerTaskExecutor()</code>.',
            '<b>Cleanup</b>: always call <code>shutdown()</code> when done.'],
        ['<b>Future</b>: <code>submit</code> returns a <code>Future</code>; <code>future.get()</code> waits for the result and rethrows a task exception as <code>ExecutionException</code>.',
            '<b>Batches</b>: <code>invokeAll</code> runs a list of tasks; <code>invokeAny</code> returns the first successful result.',
            '<b>Stopping</b>: <code>shutdown()</code> stops accepting tasks and finishes queued ones; <code>shutdownNow()</code> interrupts running tasks.'],
        ['<b>Production pools</b>: build them with <code>ThreadPoolExecutor</code> using a bounded queue, named threads, a rejection policy and metrics.',
            '<b>Overload risk</b>: <code>newCachedThreadPool</code> and the unbounded queue in <code>newFixedThreadPool</code> can exhaust memory or threads under load.',
            '<b>Java 21</b>: <code>ExecutorService</code> is <code>AutoCloseable</code>, so try-with-resources waits for tasks to finish.'],
        [['F', 'What is the Executor framework?', 'A framework that decouples task submission from how tasks are executed, using thread pools.'],
            ['F', 'What does shutdown() do?', 'It stops accepting new tasks and lets submitted ones finish.'],
            ['M', 'submit vs execute?', 'submit returns a Future and captures exceptions; execute returns nothing and exceptions go to the uncaught handler.'],
            ['M', 'Future.get() blocks. How do you avoid waiting forever?', 'Use get(timeout, unit) or cancel the future.'],
            ['S', 'Why configure ThreadPoolExecutor yourself?', 'To set a bounded queue, thread names, rejection policy and sizes, avoiding unbounded growth.'],
            ['S', 'What rejection policies exist?', 'AbortPolicy (throws), CallerRunsPolicy (runs in caller, back-pressure), DiscardPolicy, DiscardOldestPolicy.']],
        [['Fixed pool with Futures.',
            r`ExecutorService ex = Executors.newFixedThreadPool(3);
List<Callable<String>> tasks = List.of(() -> "A", () -> "B", () -> "C");
for (Future<String> f : ex.invokeAll(tasks)) {
    System.out.print(f.get() + " ");
}
ex.shutdown();
System.out.println(ex.awaitTermination(1, TimeUnit.SECONDS));

// OUTPUT:
// A B C true`],
            ['Scheduled tasks.',
                r`ScheduledExecutorService s = Executors.newScheduledThreadPool(1);
AtomicInteger n = new AtomicInteger();
ScheduledFuture<?> h = s.scheduleAtFixedRate(
    () -> System.out.println("tick " + n.incrementAndGet()),
    0, 100, TimeUnit.MILLISECONDS);   // runs at 0, 100, 200 ms
Thread.sleep(250);
h.cancel(false);
s.shutdown();

// OUTPUT:
// tick 1
// tick 2
// tick 3`]],
        [['Production-style pool.',
            r`AtomicInteger counter = new AtomicInteger();
ThreadFactory named = r -> new Thread(r, "orders-" + counter.incrementAndGet());
ThreadPoolExecutor pool = new ThreadPoolExecutor(
    4, 8, 60, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),
    named,
    new ThreadPoolExecutor.CallerRunsPolicy());
pool.submit(() -> System.out.println(Thread.currentThread().getName()));
pool.shutdown();

// OUTPUT:
// orders-1`],
            ['Timeout on get.',
                r`ExecutorService ex = Executors.newSingleThreadExecutor();
Future<String> f = ex.submit(() -> {
    Thread.sleep(2000);
    return "late";
});
try {
    f.get(200, TimeUnit.MILLISECONDS);
} catch (TimeoutException e) {
    f.cancel(true);
    System.out.println("timed out");
}
ex.shutdownNow();

// OUTPUT:
// timed out`]]
    ),

    'completable-future': x(
        ['<b>Async result:</b> <code>CompletableFuture</code> holds a result that arrives later. Start it with <code>supplyAsync(() -&gt; ...)</code>.',
            '<b>Chaining:</b> use <code>thenApply</code> and <code>thenAccept</code> to run a step when the previous one finishes.',
            '<b>Errors:</b> handle them with <code>exceptionally</code> or <code>handle</code>.',
            '<b>Waiting:</b> <code>join()</code> or <code>get()</code> waits for the result.'],
        ['<b>thenApply</b> maps the result to a new value.',
            '<b>thenCompose</b> flattens a step that returns another <code>CompletableFuture</code>.',
            '<b>thenCombine</b> merges two independent futures.',
            '<b>allOf / anyOf:</b> <code>allOf</code> waits for all futures; <code>anyOf</code> returns when the first one completes.',
            '<b>Executor:</b> pass your own executor to async methods. The default is the common <code>ForkJoinPool</code>.'],
        ['<b>Timeouts:</b> add them with <code>orTimeout</code> and <code>completeOnTimeout</code> (Java 9+).',
            '<b>Common pool:</b> never block inside it. Use a dedicated executor for blocking calls.',
            '<b>Wrapped errors:</b> failures arrive as <code>CompletionException</code>. Unwrap with <code>getCause()</code>.'],
        [['F', 'What is a CompletableFuture?', 'A future that can be completed and composed with callbacks for asynchronous programming.'],
            ['F', 'How do you run something asynchronously?', 'CompletableFuture.supplyAsync(() -> value) or runAsync.'],
            ['M', 'thenApply vs thenCompose?', 'thenApply maps a value to a value; thenCompose maps a value to another CompletableFuture and flattens it.'],
            ['M', 'How do you handle errors?', 'exceptionally(ex -> fallback) or handle((value, ex) -> ...).'],
            ['S', 'How do you run several calls in parallel and wait for all?', 'Start futures, then CompletableFuture.allOf(...).join(), and read each result.'],
            ['S', 'Why use a custom executor?', 'The common pool is shared and sized for CPU work; blocking I/O would starve it.']],
        [['Chaining and combining.',
            r`CompletableFuture<Integer> price = CompletableFuture.supplyAsync(() -> 100);
CompletableFuture<Double> rate = CompletableFuture.supplyAsync(() -> 0.18);
String result = price
    .thenCombine(rate, (p, r) -> p * (1 + r))
    .thenApply(v -> String.format("%.2f", v))
    .get();
System.out.println(result);

// OUTPUT:
// 118.00`],
            ['Errors and timeout.',
                r`CompletableFuture<String> f = CompletableFuture
    .supplyAsync(() -> {
        if (true) throw new IllegalStateException("down");
        return "ok";
    })
    .orTimeout(1, TimeUnit.SECONDS)
    .exceptionally(ex -> "fallback (" + ex.getCause().getMessage() + ")");
System.out.println(f.get());

// OUTPUT:
// fallback (down)`]],
        [['Parallel calls with allOf.',
            r`List<CompletableFuture<String>> fs = List.of("a", "b", "c").stream()
    .map(s -> CompletableFuture.supplyAsync(() -> s.toUpperCase()))
    .toList();
CompletableFuture.allOf(fs.toArray(new CompletableFuture[0])).join();
System.out.println(fs.stream().map(CompletableFuture::join).toList());

// OUTPUT:
// [A, B, C]`],
            ['thenCompose flatten.',
                r`CompletableFuture<String> user = CompletableFuture.supplyAsync(() -> "u1");
CompletableFuture<String> email = user.thenCompose(
    id -> CompletableFuture.supplyAsync(() -> id + "@mail.com"));
System.out.println(email.get());

// OUTPUT:
// u1@mail.com`]]
    ),

    'concurrent-collections': x(
        ['<b>Thread-safe collections</b> live in <code>java.util.concurrent</code>: <code>ConcurrentHashMap</code>, <code>CopyOnWriteArrayList</code>, <code>ConcurrentLinkedQueue</code> and the <code>BlockingQueue</code> family.',
            '<b>No ConcurrentModificationException</b>: iterators are weakly consistent or work on a snapshot.',
            '<b>Better scaling</b> than <code>Collections.synchronizedMap</code> or <code>Hashtable</code>.'],
        ['<b>Atomic methods</b>: <code>ConcurrentHashMap</code> offers <code>putIfAbsent</code>, <code>computeIfAbsent</code> and <code>merge</code>. Null keys and values are not allowed.',
            '<b>Copy on write</b>: <code>CopyOnWriteArrayList</code> copies the array on each write. It suits many reads and few writes (listeners).',
            '<b>Producer-consumer</b>: <code>BlockingQueue</code> (<code>ArrayBlockingQueue</code>, <code>LinkedBlockingQueue</code>) uses <code>put</code> and <code>take</code>.'],
        ['<b>Compound operations</b> across separate calls are still not atomic. Use the atomic methods, not get then put.',
            '<b>Other types</b>: <code>ConcurrentSkipListMap</code> is a sorted concurrent map; <code>ConcurrentLinkedDeque</code> is a lock-free deque.',
            '<b><code>size()</code></b> is only an estimate while other threads update the structure.'],
        [['F', 'Why use concurrent collections?', 'They are safe and efficient for multi-threaded access without external locking.'],
            ['F', 'Does ConcurrentHashMap allow null?', 'No keys or values may be null.'],
            ['M', 'ConcurrentHashMap vs synchronizedMap?', 'ConcurrentHashMap locks per bin and uses CAS (compare-and-set), so many threads proceed in parallel. synchronizedMap uses one lock for the whole map.'],
            ['M', 'When use CopyOnWriteArrayList?', 'When reads vastly outnumber writes, like listener lists.'],
            ['S', 'How do you atomically increment a counter in a map?', 'map.merge(key, 1, Integer::sum) or compute.'],
            ['S', 'What does weakly consistent iteration mean?', 'The iterator reflects some state at or after creation and never throws ConcurrentModificationException.']],
        [['Atomic updates in ConcurrentHashMap.',
            r`ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();
List.of("a", "b", "a", "c", "a").parallelStream()
    .forEach(w -> counts.merge(w, 1, Integer::sum));
System.out.println(new TreeMap<>(counts));

// OUTPUT:
// {a=3, b=1, c=1}`],
            ['BlockingQueue pipeline.',
                r`BlockingQueue<String> q = new LinkedBlockingQueue<>(2);
new Thread(() -> {
    try {
        for (String s : List.of("x", "y", "z")) q.put(s);   // blocks when full
        q.put("END");
    } catch (InterruptedException e) { }
}).start();
String s;
while (!(s = q.take()).equals("END")) System.out.print(s + " ");
System.out.println();

// OUTPUT:
// x y z`]],
        [['Check-then-act race.',
            r`Map<String, Integer> m = new ConcurrentHashMap<>();
// racy:   if (!m.containsKey("k")) m.put("k", 1);
m.putIfAbsent("k", 1);                       // atomic
System.out.println(m);

// OUTPUT:
// {k=1}`],
            ['Snapshot iteration.',
                r`CopyOnWriteArrayList<Integer> l = new CopyOnWriteArrayList<>(List.of(1, 2, 3));
for (int v : l) if (v == 2) l.add(99);
System.out.println(l);

// OUTPUT:
// [1, 2, 3, 99]`]]
    ),

    'locks-in-java': x(
        ['<b>Locks</b> in <code>java.util.concurrent.locks</code> give more control than <code>synchronized</code>: <code>ReentrantLock</code>, <code>ReadWriteLock</code>, <code>StampedLock</code>.',
            '<b>Always unlock in finally</b>: <code>lock.lock(); try { ... } finally { lock.unlock(); }</code>.',
            '<b>tryLock()</b> tries without blocking; <code>tryLock(timeout, unit)</code> waits a limited time.'],
        ['<b>Fairness, interrupts, conditions</b>: <code>ReentrantLock</code> supports fair order, interruptible waits (<code>lockInterruptibly</code>) and many <code>Condition</code> objects.',
            '<b>Read-write lock</b>: <code>ReentrantReadWriteLock</code> allows many readers or one writer.',
            '<b>Reentrant</b> means the same thread can acquire the lock again; you must unlock the same number of times.'],
        ['<b>StampedLock</b> offers optimistic reads (<code>tryOptimisticRead</code> and <code>validate</code>) for very read-heavy data but is not reentrant.',
            '<b>Prefer synchronized</b> when it is enough: it is simpler and fine for most code. Use locks for advanced needs.',
            '<b>Keep critical sections short</b>: avoid holding locks during I/O or while calling unknown code.'],
        [['F', 'What advantage does ReentrantLock have over synchronized?', 'tryLock, timeouts, interruptible locking, fairness and multiple conditions.'],
            ['F', 'Where must unlock be called?', 'In a finally block so it always runs.'],
            ['M', 'What does reentrant mean?', 'The thread that holds the lock can acquire it again without blocking.'],
            ['M', 'ReadWriteLock use case?', 'A cache read often and written rarely: many readers in parallel, exclusive writers.'],
            ['S', 'How does StampedLock optimistic read work?', 'You read without locking, then validate the stamp; if a write happened, retry with a real read lock.'],
            ['S', 'How can you avoid deadlock with locks?', 'Acquire locks in a fixed order or use tryLock with a timeout and back off.']],
        [['Lock with tryLock (inside a method that throws InterruptedException).',
            r`ReentrantLock lock = new ReentrantLock();
if (lock.tryLock(200, TimeUnit.MILLISECONDS)) {
    try {
        System.out.println("working, holds=" + lock.getHoldCount());
    } finally {
        lock.unlock();
    }
} else {
    System.out.println("busy, try later");
}

// OUTPUT:
// working, holds=1`],
            ['Condition for a bounded buffer.',
                r`class Buffer {
    final Lock l = new ReentrantLock();
    final Condition notEmpty = l.newCondition();
    final Deque<Integer> q = new ArrayDeque<>();

    void put(int v) {
        l.lock();
        try { q.add(v); notEmpty.signal(); } finally { l.unlock(); }
    }

    int take() throws InterruptedException {
        l.lock();
        try {
            while (q.isEmpty()) notEmpty.await();   // loop guards spurious wakeups
            return q.poll();
        } finally { l.unlock(); }
    }
}
Buffer b = new Buffer();
new Thread(() -> b.put(7)).start();
System.out.println(b.take());

// OUTPUT:
// 7`]],
        [['Forgetting unlock: wrong version, then the fix.',
            r`Lock l = new ReentrantLock();

// WRONG: an exception skips unlock, so the lock stays held forever
l.lock();
doWork();          // may throw
l.unlock();

// RIGHT: finally always releases the lock
l.lock();
try {
    doWork();
} finally {
    l.unlock();
}

// OUTPUT:
// (no console output) the WRONG version can leave other threads blocked forever`],
            ['Optimistic read.',
                r`StampedLock sl = new StampedLock();
double[] pt = {1, 2};
long st = sl.tryOptimisticRead();     // no lock taken
double x = pt[0], y = pt[1];
if (!sl.validate(st)) {               // a write happened: fall back to a real read lock
    st = sl.readLock();
    try { x = pt[0]; y = pt[1]; } finally { sl.unlockRead(st); }
}
System.out.println(x + "," + y);

// OUTPUT:
// 1.0,2.0`]]
    ),

    'exception-handling': x(
        ['<b>Exception</b>: an event that disrupts normal flow. Handle it with <code>try</code>, <code>catch</code> and <code>finally</code>.',
            '<b>Roles</b>: code that may fail goes in <code>try</code>; <code>catch</code> handles specific types; <code>finally</code> always runs (cleanup).',
            '<b>Unhandled exceptions</b> end the thread and print a stack trace.'],
        ['<b>Catch order</b>: catch the most specific exception first; a <b>multi-catch</b> uses <code>catch (A | B e)</code>.',
            '<b>Auto-close</b>: use <code>try-with-resources</code> to close resources automatically.',
            '<b>Never swallow</b> exceptions: at least log them with the stack trace.'],
        ['<b>Catch where you can act</b> (retry, fallback, translate), not everywhere; let others propagate.',
            '<b>Wrap</b> low-level exceptions in domain exceptions with the cause: <code>throw new ServiceException("msg", e)</code>.',
            '<b>No control flow</b>: do not use exceptions for normal flow; they are slow and obscure logic.'],
        [['F', 'What is an exception?', 'An event that interrupts the normal flow of a program.'],
            ['F', 'When does finally run?', 'Always after try/catch, whether or not an exception happened (except System.exit or a JVM crash).'],
            ['M', 'Why catch specific exceptions first?', 'A broader catch before a narrower one makes the narrower unreachable and is a compile error.'],
            ['M', 'What is try-with-resources?', 'A try that automatically closes AutoCloseable resources at the end.'],
            ['S', 'Why not catch Exception everywhere?', 'It hides bugs and handles errors you cannot meaningfully recover from.'],
            ['S', 'What is exception translation?', 'Catching a low-level exception and throwing a higher-level one (with the cause) that fits the abstraction layer.']],
        [['try, catch, finally.',
            r`static int parse(String s) {
    try { return Integer.parseInt(s); }
    catch (NumberFormatException e) { System.out.println("bad number: " + s); return -1; }
    finally { System.out.println("parsed " + s); }
}
System.out.println(parse("12") + " " + parse("x"));

// OUTPUT:
// parsed 12
// bad number: x
// parsed x
// 12 -1`],
            ['Translate and keep the cause.',
                r`class DataException extends RuntimeException {
    DataException(String m, Throwable c) { super(m, c); }
}

// inside a method:
try {
    Integer.parseInt("zz");
} catch (NumberFormatException e) {
    DataException d = new DataException("invalid order id", e);
    System.out.println(d.getMessage() + " <- "
        + d.getCause().getClass().getSimpleName());
}

// OUTPUT:
// invalid order id <- NumberFormatException`]],
        [['Order of catch blocks.',
            r`try {
    Object o = null;
    o.toString();
} catch (NullPointerException e) {
    System.out.println("NPE");
} catch (RuntimeException e) {
    System.out.println("other");
}
// a catch (Exception e) BEFORE NullPointerException would not compile

// OUTPUT:
// NPE`],
            ['Swallowed exception (bad).',
                r`try {
    riskyCall();
} catch (Exception e) {
    // empty block: hides the failure
}
// better: log.error("riskyCall failed", e); throw e;

// OUTPUT:
// the failure is invisible without logging`]]
    ),

    'exceptions': x(
        ['<b>Checked</b> exceptions (<code>IOException</code>, <code>SQLException</code>) must be caught or declared with <code>throws</code>; the compiler enforces it.',
            '<b>Unchecked</b> exceptions extend <code>RuntimeException</code> (<code>NullPointerException</code>, <code>IllegalArgumentException</code>) and need not be declared.',
            '<b>Error</b> (<code>OutOfMemoryError</code>, <code>StackOverflowError</code>) signals serious JVM problems.'],
        ['<b>Hierarchy</b>: <code>Throwable</code> splits into <code>Exception</code> (checked, except <code>RuntimeException</code>) and <code>Error</code>.',
            '<b>Choosing</b>: use checked exceptions for recoverable conditions the caller must handle; use unchecked for programming errors.',
            '<b>Frameworks</b> such as Spring prefer unchecked exceptions to avoid cluttered signatures.'],
        ['<b>Lambdas and streams</b>: checked exceptions do not compose well with them, so wrap them in unchecked ones.',
            '<b>Javadoc</b>: document thrown exceptions with <code>@throws</code>.',
            '<b>Design</b>: build exception hierarchies per module, with meaningful names and context in messages.'],
        [['F', 'Checked vs unchecked exceptions?', 'Checked must be handled or declared at compile time; unchecked (RuntimeException) need not.'],
            ['F', 'Give an example of each.', 'Checked: IOException; unchecked: NullPointerException.'],
            ['M', 'Are Errors checked?', 'No, Error and its subclasses are unchecked and usually not handled.'],
            ['M', 'When use a checked exception?', 'When the caller can reasonably recover, such as a missing file the user can fix.'],
            ['S', 'Why do many frameworks avoid checked exceptions?', 'They force boilerplate and do not work well with lambdas; unchecked exceptions with clear types are simpler.'],
            ['S', 'How do you handle a checked exception inside a lambda?', 'Wrap it in an unchecked exception or write a small functional wrapper.']],
        [['Checked vs unchecked.',
            r`static void read(String p) throws IOException {   // must declare
    Files.readString(Path.of(p));
}
try { read("missing.txt"); }
catch (IOException e) { System.out.println("checked: " + e.getClass().getSimpleName()); }
try { Object o = "s"; Integer i = (Integer) o; }
catch (ClassCastException e) { System.out.println("unchecked: ClassCastException"); }

// OUTPUT:
// checked: NoSuchFileException
// unchecked: ClassCastException`],
            ['Wrap in lambdas.',
                r`List<String> files = List.of("a.txt");
files.forEach(f -> {
    try { Files.readString(Path.of(f)); }
    catch (IOException e) { throw new UncheckedIOException(e); }
});

// OUTPUT:
// UncheckedIOException (for a missing file)`]],
        [['Hierarchy lookup.',
            r`System.out.println(IOException.class.getSuperclass().getSimpleName() + " "
    + NullPointerException.class.getSuperclass().getSimpleName() + " "
    + OutOfMemoryError.class.getSuperclass().getSimpleName());

// OUTPUT:
// Exception RuntimeException VirtualMachineError`],
            ['Compiler enforcement.',
                r`// void m() { throw new IOException("x"); }
// error: unreported exception IOException; must be caught or declared

// OUTPUT:
// compile-time error`]]
    ),

    'error': x(
        ['<b><code>Error</code></b> means a serious JVM or environment problem: <code>OutOfMemoryError</code>, <code>StackOverflowError</code>, <code>NoClassDefFoundError</code>, <code>AssertionError</code>.',
            '<b>Do not catch</b> them in normal code; the program often cannot recover.',
            'Errors are <b>unchecked</b> and extend <code>Throwable</code>, not <code>Exception</code>.'],
        ['<b><code>StackOverflowError</code></b>: recursion is too deep; fix with a base case or a loop.',
            '<b><code>OutOfMemoryError</code></b>: heap, metaspace or native memory is full; analyze with a heap dump.',
            '<b><code>NoClassDefFoundError</code></b>: the class existed at compile time but is missing at run time (classpath problem or failed static init).'],
        ['<b>Heap dump</b>: enable <code>-XX:+HeapDumpOnOutOfMemoryError</code> and analyze with Eclipse MAT or VisualVM.',
            '<b>Containers</b>: use <code>-XX:+ExitOnOutOfMemoryError</code> so the orchestrator restarts the process.',
            '<b>Memory leaks</b> often come from static collections, listeners, unbounded caches and <code>ThreadLocal</code> values.'],
        [['F', 'What is an Error in Java?', 'A serious problem from the JVM or system that applications usually cannot handle.'],
            ['F', 'Give examples.', 'OutOfMemoryError and StackOverflowError.'],
            ['M', 'Exception vs Error?', 'Exceptions are conditions programs can handle; Errors signal severe failures typically not recoverable.'],
            ['M', 'What causes StackOverflowError?', 'Infinite or very deep recursion exhausting the thread stack.'],
            ['S', 'How do you investigate an OutOfMemoryError?', 'Capture a heap dump with HeapDumpOnOutOfMemoryError and analyze the dominators in Eclipse MAT.'],
            ['S', 'Why use ExitOnOutOfMemoryError in containers?', 'A JVM in an unknown state should terminate so it is restarted cleanly.']],
        [['StackOverflowError.',
            r`static int depth = 0;
static void recurse() { depth++; recurse(); }
try {
    recurse();
} catch (StackOverflowError e) {
    System.out.println("overflow at depth > 1000: " + (depth > 1000));
}

// OUTPUT:
// overflow at depth > 1000: true`],
            ['OOM flags.',
                r`// java -Xmx256m -XX:+HeapDumpOnOutOfMemoryError
//      -XX:HeapDumpPath=./dump.hprof -XX:+ExitOnOutOfMemoryError -jar app.jar
// java.lang.OutOfMemoryError: Java heap space

// OUTPUT:
// dump.hprof is written, then the JVM exits`]],
        [['Leak through a static collection.',
            r`class Cache {
    static final List<byte[]> DATA = new ArrayList<>();
    static void add() { DATA.add(new byte[1_048_576]); }
}
// calling add() in a loop eventually throws OutOfMemoryError: Java heap space

// OUTPUT:
// java.lang.OutOfMemoryError: Java heap space (fix: bound the cache, e.g. Caffeine)`],
            ['AssertionError.',
                r`// run with: java -ea Main
assert 1 + 1 == 3 : "math broke";

// OUTPUT:
// Exception in thread "main" java.lang.AssertionError: math broke`]]
    ),

    'error2': x(
        ['<b>Common questions:</b> checked vs unchecked, <code>final</code> vs <code>finally</code> vs <code>finalize</code>, <code>throw</code> vs <code>throws</code>, try-with-resources, custom exceptions.',
            '<b>Flow:</b> know what happens when an exception is thrown in <code>try</code>, <code>catch</code> and <code>finally</code>.',
            '<b>Hierarchy:</b> be able to explain <code>Throwable</code>, <code>Exception</code>, <code>Error</code> and how to read a stack trace.'],
        ['<b>Return in finally:</b> <code>finally</code> runs even if <code>try</code> returns; a <code>return</code> inside <code>finally</code> overrides everything.',
            '<b>Lost exception:</b> if both <code>try</code> and <code>finally</code> throw, the <code>finally</code> exception wins and the original is lost. try-with-resources avoids this by keeping it as a suppressed exception.',
            '<b>Context:</b> rethrow with the cause, as in <code>throw new X("msg", cause)</code>.'],
        ['<b>Strategy:</b> fail fast, validate inputs, translate exceptions at layer boundaries, log once, never use exceptions for control flow, and design an error model for APIs (problem details, error codes).',
            '<b>Performance:</b> capturing a stack trace is expensive; override <code>fillInStackTrace</code> only for hot control-flow exceptions (rare).',
            '<b>Concurrency:</b> exceptions in tasks are captured in <code>Future</code> objects or handled by uncaught-exception handlers.'],
        [['F', 'Difference between throw and throws?', 'throw raises an exception; throws declares exceptions a method may throw.'],
            ['F', 'Can finally be skipped?', 'Only if the JVM exits (System.exit) or crashes.'],
            ['M', 'What is a suppressed exception?', 'An exception thrown while closing a resource that is attached to the primary exception with addSuppressed.'],
            ['M', 'What happens if try returns a value and finally modifies it?', 'For primitives and immutable values the returned value is already fixed; for mutable objects the change is visible.'],
            ['S', 'How do you design exceptions for a library?', 'A small hierarchy with a base exception, informative messages, causes and documentation; prefer unchecked for programming errors.'],
            ['S', 'How should errors be exposed in REST APIs?', 'With consistent status codes and a structured body (RFC 7807 problem details), never leaking stack traces.']],
        [['finally and return.',
            r`static int f() {
    int x = 1;
    try { return x; } finally { x = 2; }      // return value already copied
}
static StringBuilder g() {
    StringBuilder sb = new StringBuilder("a");
    try { return sb; } finally { sb.append("b"); }   // same object, change seen
}
System.out.println(f() + " " + g());

// OUTPUT:
// 1 ab`],
            ['Suppressed exception.',
                r`class Res implements AutoCloseable {
    public void close() { throw new IllegalStateException("close failed"); }
}
try (Res r = new Res()) {
    throw new RuntimeException("body failed");
} catch (Exception e) {
    System.out.println(e.getMessage()
        + " suppressed=" + e.getSuppressed()[0].getMessage());
}

// OUTPUT:
// body failed suppressed=close failed`]],
        [['finally overrides exception.',
            r`static int bad() {
    try {
        throw new RuntimeException("lost");   // silently discarded
    } finally {
        return 5;
    }
}
System.out.println(bad());

// OUTPUT:
// 5`],
            ['Problem details response.',
                r`// HTTP 404  Content-Type: application/problem+json
// {
//   "type": "https://api.example.com/errors/not-found",
//   "title": "Order not found",
//   "status": 404,
//   "detail": "No order with id 42"
// }

// OUTPUT:
// clients get a stable machine-readable error`]]
    ),

    'exception-handling3': x(
        ['<b>Raising:</b> <code>throw</code> raises an exception object, for example <code>throw new IllegalArgumentException("age &lt; 0");</code>.',
            '<b>Declaring:</b> <code>throws</code> lists in the method signature which checked exceptions the method may pass to its caller.',
            '<b>Position:</b> <code>throw</code> is a statement inside a method; <code>throws</code> is part of the method declaration.',
            '<b>Allowed types:</b> you can throw only <code>Throwable</code> objects.'],
        ['<b>Several exceptions:</b> a method can declare many, such as <code>void m() throws IOException, SQLException</code>.',
            '<b>Overriding:</b> an overriding method cannot throw broader checked exceptions than the parent method.',
            '<b>Rethrow:</b> in a catch block use <code>throw e;</code>, or wrap it in a new exception and pass the original as the cause.'],
        ['<b>Fail fast:</b> validate arguments early with <code>throw new IllegalArgumentException</code> or <code>Objects.requireNonNull</code>.',
            '<b>Messages:</b> include the bad value and context, but never secrets.',
            '<b>Precise rethrow (Java 7):</b> rethrowing a caught general <code>Exception</code> needs to declare only the specific checked exceptions the try block can throw.'],
        [['F', 'throw vs throws?', 'throw actually throws an exception; throws declares possible checked exceptions in the signature.'],
            ['F', 'Can you throw a String?', 'No, only Throwable objects.'],
            ['M', 'Can an overriding method throw a broader checked exception?', 'No, it may throw the same, narrower or no checked exceptions.'],
            ['M', 'How do you rethrow an exception with extra context?', 'Catch it and throw a new exception passing the original as cause.'],
            ['S', 'What is precise rethrow?', 'Since Java 7 the compiler knows the exact checked exceptions a try block can throw, so catching Exception and rethrowing the same variable declares only those.'],
            ['S', 'Why use requireNonNull?', 'It fails fast with a clear message at the point of misuse.']],
        [['throw and throws together.',
            r`static void withdraw(double bal, double amt) throws InsufficientFundsException {
    if (amt <= 0) throw new IllegalArgumentException("amount must be positive: " + amt);
    if (amt > bal) throw new InsufficientFundsException("need " + (amt - bal) + " more");
}
class InsufficientFundsException extends Exception { InsufficientFundsException(String m) { super(m); } }
try { withdraw(100, 150); } catch (InsufficientFundsException e) { System.out.println(e.getMessage()); }

// OUTPUT:
// need 50.0 more`],
            ['Fail fast.',
                r`record User(String name) { User { Objects.requireNonNull(name, "name must not be null"); } }
try { new User(null); } catch (NullPointerException e) { System.out.println(e.getMessage()); }

// OUTPUT:
// name must not be null`]],
        [['Overriding rule.',
            r`class P { void m() throws IOException {} }
class C extends P { @Override void m() {} }       // fewer exceptions: fine
// class D extends P { @Override void m() throws Exception {} }
// error: overridden method does not throw Exception

// OUTPUT:
// D does not compile`],
            ['Rethrow with cause.',
                r`try {
    Files.readString(Path.of("cfg.txt"));
} catch (IOException e) {
    throw new IllegalStateException("cannot load config", e);
}

// OUTPUT:
// IllegalStateException: cannot load config  Caused by: NoSuchFileException: cfg.txt`]]
    )
};

export const java06Deep: Record<string, Deep> = {
    'executor-framework': dv(
        [`<p>For each new task, <code>ThreadPoolExecutor</code> follows these steps in order:</p>
<ol>
<li>Fewer than <b>core</b> threads exist: start a new thread.</li>
<li>Otherwise: put the task in the <b>queue</b>.</li>
<li>Queue full and fewer than <b>max</b> threads: start an extra thread.</li>
<li>Otherwise: <b>reject</b> the task.</li>
</ol>
<ul>
<li><code>newFixedThreadPool</code> uses an unbounded queue, so the max size is never used.</li>
<li><code>newCachedThreadPool</code> uses a <code>SynchronousQueue</code>, so threads grow without bound.</li>
<li><code>ForkJoinPool</code> is different: each worker has its own deque and idle workers steal tasks.</li>
</ul>`,
            r`ThreadPoolExecutor p = new ThreadPoolExecutor(
    1, 3, 10, TimeUnit.SECONDS, new ArrayBlockingQueue<>(1));
CountDownLatch hold = new CountDownLatch(1);
Runnable blocker = () -> {
    try { hold.await(); } catch (InterruptedException e) { }
};
p.execute(blocker);   // 1: core thread
p.execute(blocker);   // 2: goes to the queue
p.execute(blocker);   // 3: queue full, extra thread
p.execute(blocker);   // 4: queue full, extra thread (max = 3)
System.out.println("pool=" + p.getPoolSize()
    + " queue=" + p.getQueue().size());
try {
    p.execute(blocker);   // 5: nothing left, rejected
} catch (RejectedExecutionException e) {
    System.out.println("rejected");
}
hold.countDown();
p.shutdown();

// OUTPUT:
// pool=3 queue=1
// rejected`],
        [`<p>Sizing and shutdown rules:</p>
<ul>
<li><b>CPU-bound</b> pool: about the number of cores (+1).</li>
<li><b>I/O-bound</b> pool: about cores x (1 + wait time / compute time).</li>
<li><b>Virtual threads</b> remove the need to size for I/O. Limit them with a <code>Semaphore</code>.</li>
<li><b>Shutdown steps</b>: <code>shutdown()</code>, then <code>awaitTermination</code>, then <code>shutdownNow()</code>.</li>
<li><b>Context</b>: wrap tasks to copy MDC or trace context to the worker thread.</li>
<li><b>Results as they finish</b>: use <code>ExecutorCompletionService</code>.</li>
</ul>`,
            r`ExecutorService ex = Executors.newFixedThreadPool(3);
CompletionService<Integer> cs = new ExecutorCompletionService<>(ex);
for (int ms : new int[]{300, 100, 200}) {
    cs.submit(() -> {
        Thread.sleep(ms);
        return ms;
    });
}
for (int i = 0; i < 3; i++) {
    System.out.print(cs.take().get() + " ");   // fastest first
}
System.out.println();
ex.shutdown();
if (!ex.awaitTermination(2, TimeUnit.SECONDS)) {
    ex.shutdownNow();
}

// OUTPUT:
// 100 200 300`],
        [`<p>Common mistakes:</p>
<ul>
<li><b>No shutdown</b>: non-daemon pool threads keep the JVM alive.</li>
<li><b>Unbounded queues</b> hide overload until memory runs out.</li>
<li><b>Starvation deadlock</b>: a task waits for another task in the same pool.</li>
<li><b>Ignored Future</b>: exceptions are lost when nobody calls <code>get()</code>.</li>
<li><b>New pool per request</b>: wastes threads. Create pools once and reuse them.</li>
<li><b>One tiny shared pool</b> for unrelated work: no bulkheads.</li>
</ul>`,
            r`ExecutorService one = Executors.newSingleThreadExecutor();
Future<String> outer = one.submit(() -> {
    // the only thread is busy here, so "inner" can never start
    Future<String> inner = one.submit(() -> "inner");
    return inner.get();
});
try {
    outer.get(500, TimeUnit.MILLISECONDS);
} catch (TimeoutException e) {
    System.out.println("starved: pool deadlock");
}
one.shutdownNow();

// OUTPUT:
// starved: pool deadlock`],
        [`<p>Tuning checklist:</p>
<ul>
<li><b>Monitor</b>: active count, queue size, completed tasks, rejections and task wait time.</li>
<li><b>Back-pressure</b>: use a bounded queue and <code>CallerRunsPolicy</code> to slow producers.</li>
<li><b>Fewer pools</b>: keep each pool for a clear purpose.</li>
<li><b>Metrics</b>: publish them through Micrometer.</li>
</ul>`,
            r`ThreadPoolExecutor tpe =
    (ThreadPoolExecutor) Executors.newFixedThreadPool(4);
System.out.println("active=" + tpe.getActiveCount()
    + " queued=" + tpe.getQueue().size()
    + " done=" + tpe.getCompletedTaskCount());
tpe.shutdown();

// OUTPUT:
// active=0 queued=0 done=0`],
        [`Real-world: separate bulkhead pools for payments and notifications so a slow email provider cannot starve payment processing.`,
            r`// namedFactory(...) is a small helper that returns a ThreadFactory
ExecutorService payments = new ThreadPoolExecutor(
    8, 8, 0, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(200), namedFactory("pay"));
ExecutorService email = new ThreadPoolExecutor(
    2, 2, 0, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(1000), namedFactory("mail"),
    new ThreadPoolExecutor.DiscardOldestPolicy());

// OUTPUT:
// a flood of emails never blocks payment work`]
    ),

    'completable-future': dv(
        [`<p>A <code>CompletableFuture</code> is a small state machine. It is pending, completed normally, or completed exceptionally. It also keeps a stack of dependent actions.</p>
<ul>
<li>Each stage runs when its source completes.</li>
<li><code>thenApply</code> runs in the thread that completed the source.</li>
<li><code>thenApplyAsync</code> runs on an executor.</li>
<li>Exceptions travel down the chain as <code>CompletionException</code> until a stage handles them.</li>
</ul>`,
            r`CompletableFuture<String> cf = CompletableFuture
    .supplyAsync(() -> {
        String name = Thread.currentThread().getName();
        System.out.println("supply on pool: " + name.startsWith("ForkJoinPool"));
        return "x";
    })
    .thenApply(s -> s + "y")
    .thenApplyAsync(s -> s + "z");
System.out.println(cf.join());

// OUTPUT:
// supply on pool: true
// xyz`],
        [`<p>More methods you will meet:</p>
<ul>
<li><code>thenAcceptBoth</code> consumes two results together.</li>
<li><code>applyToEither</code> uses whichever of two futures finishes first.</li>
<li><code>whenComplete</code> observes the result or error without changing it.</li>
<li><code>exceptionallyCompose</code> recovers with another future (Java 12+).</li>
<li><code>completeAsync</code> and <code>failedFuture</code> create or finish futures by hand (Java 9+).</li>
<li><code>new CompletableFuture&lt;&gt;()</code> plus <code>complete</code> turns a callback API into a future.</li>
</ul>`,
            r`static CompletableFuture<String> callApi(String id) {
    CompletableFuture<String> f = new CompletableFuture<>();
    // adapt a callback-style API
    new Thread(() -> f.complete("data-" + id)).start();
    return f;
}

List<CompletableFuture<String>> all = Stream.of("1", "2", "3")
    .map(Main::callApi)
    .toList();
CompletableFuture<List<String>> joined = CompletableFuture
    .allOf(all.toArray(new CompletableFuture[0]))
    .thenApply(v -> all.stream().map(CompletableFuture::join).toList());
System.out.println(joined.get());
System.out.println(callApi("9")
    .completeOnTimeout("default", 1, TimeUnit.SECONDS)
    .join());

// OUTPUT:
// [data-1, data-2, data-3]
// data-9`],
        [`<p>Common mistakes:</p>
<ul>
<li>Calling <code>get()</code> inside an async chain. It blocks a pool thread.</li>
<li>Forgetting errors. A failed future stays silent if nobody calls <code>join()</code>.</li>
<li>Running blocking calls on the common pool.</li>
<li>Thinking <code>thenApply</code> is async. It runs in the completing thread.</li>
<li>Losing thread context (MDC, security) when work moves to another thread.</li>
<li>Using <code>allOf</code> and forgetting to read the results from the original futures.</li>
<li>Using <code>thenApply</code> with a function that returns a future. Use <code>thenCompose</code>.</li>
</ul>`,
            r`// wrong: nested future
CompletableFuture<CompletableFuture<String>> nested = CompletableFuture
    .supplyAsync(() -> "a")
    .thenApply(s -> CompletableFuture.supplyAsync(() -> s + "b"));

// right: flattened
CompletableFuture<String> flat = CompletableFuture
    .supplyAsync(() -> "a")
    .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + "b"));
System.out.println(flat.join());

// never joined, so the error is silent
CompletableFuture.supplyAsync(() -> {
    throw new RuntimeException("nobody sees me");
});

// OUTPUT:
// ab`],
        [`<p>Each stage adds a little overhead and allocation.</p>
<ul>
<li>This is fine for I/O composition and wasteful for tiny CPU steps.</li>
<li>Use a dedicated executor with a bounded size for blocking calls.</li>
<li>Set a timeout on every remote call and avoid unbounded fan-out.</li>
<li>For large pipelines, consider Reactor, or virtual threads with plain blocking code (often simpler).</li>
</ul>`,
            r`ExecutorService io = Executors.newFixedThreadPool(32);
List<CompletableFuture<Integer>> calls = IntStream.range(0, 100)
    .mapToObj(i -> CompletableFuture
        .supplyAsync(() -> remote(i), io)
        .orTimeout(2, TimeUnit.SECONDS))
    .toList();
int total = calls.stream().mapToInt(CompletableFuture::join).sum();

// OUTPUT:
// 100 calls complete in about (100 / 32) x latency`],
        [`Real-world: aggregating a product page from three services in parallel with fallbacks, so one slow dependency does not fail the page.`,
            r`CompletableFuture<Product> p =
    supplyAsync(() -> productSvc.get(id), io);
CompletableFuture<Price> pr = supplyAsync(() -> priceSvc.get(id), io)
    .orTimeout(300, TimeUnit.MILLISECONDS)
    .exceptionally(e -> Price.UNKNOWN);
CompletableFuture<List<Review>> rv = supplyAsync(() -> reviewSvc.top(id), io)
    .completeOnTimeout(List.of(), 300, TimeUnit.MILLISECONDS);
Page page = p.thenCombine(pr, Page::new)
    .thenCombine(rv, Page::withReviews)
    .join();

// OUTPUT:
// the page renders with defaults when prices or reviews are slow`]
    ),

    'concurrent-collections': dv(
        [`ConcurrentHashMap (Java 8+) uses an array of bins: empty bins are filled with CAS, non-empty bins are locked on the head node, long bins become trees, and resizing is cooperative (threads help transfer). Reads are lock-free via volatile reads. <code>CopyOnWriteArrayList</code> swaps in a new array on writes under a lock. <code>ConcurrentLinkedQueue</code> is a lock-free Michael-Scott queue; <code>LinkedBlockingQueue</code> uses two locks (put and take).`,
            r`ConcurrentHashMap<Integer, Integer> m = new ConcurrentHashMap<>();
IntStream.range(0, 1000).parallel()
    .forEach(i -> m.merge(i % 10, 1, Integer::sum));
int total = m.values().stream().mapToInt(Integer::intValue).sum();
System.out.println(total + " " + m.mappingCount());
System.out.println(m.reduceValues(1, Integer::sum));

// OUTPUT:
// 1000 10
// 1000`],
        [`Choose by access pattern:<ul>
<li><code>ConcurrentHashMap</code>: general use.</li>
<li><code>ConcurrentSkipListMap</code> / <code>ConcurrentSkipListSet</code>: sorted.</li>
<li><code>CopyOnWriteArrayList</code> / <code>CopyOnWriteArraySet</code>: read-mostly.</li>
<li><code>ArrayBlockingQueue</code>: bounded, gives back-pressure. <code>LinkedBlockingQueue</code>: optionally bounded.</li>
<li><code>PriorityBlockingQueue</code>, <code>DelayQueue</code> (items released after a delay), <code>LinkedTransferQueue</code>, <code>ConcurrentLinkedDeque</code>.</li>
</ul>
<code>ConcurrentHashMap</code> also has bulk operations: <code>forEach</code>, <code>search</code> and <code>reduce</code>, each taking a parallelism threshold.`,
            r`DelayQueue<Delayed> dq = new DelayQueue<>();
class Job implements Delayed {
    final long at; final String n;
    Job(String n, long ms) { this.n = n; at = System.currentTimeMillis() + ms; }
    public long getDelay(TimeUnit u) {
        return u.convert(at - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }
    public int compareTo(Delayed o) { return Long.compare(at, ((Job) o).at); }
}
dq.add(new Job("later", 200));
dq.add(new Job("soon", 50));
System.out.println(((Job) dq.take()).n + " " + ((Job) dq.take()).n);

// OUTPUT:
// soon later`],
        [`Common mistakes:<ul>
<li>Compound check-then-act. Use atomic methods instead.</li>
<li>Expecting <code>size()</code> to be exact.</li>
<li>Storing null keys or values.</li>
<li>Keeping an iterator across updates.</li>
<li>Using <code>CopyOnWriteArrayList</code> for write-heavy data (O(n) copy per write).</li>
<li>Unbounded blocking queues (memory keeps growing).</li>
<li>Wrapping a <code>ConcurrentHashMap</code> in <code>synchronized</code>, which defeats its purpose.</li>
</ul>`,
            r`ConcurrentHashMap<String, List<String>> groups = new ConcurrentHashMap<>();
groups.computeIfAbsent("a", k -> new CopyOnWriteArrayList<>())   // atomic creation
      .add("x");                                                 // thread-safe list
try {
    new ConcurrentHashMap<String, String>().put("k", null);
} catch (NullPointerException e) {
    System.out.println("no null values");
}

// OUTPUT:
// no null values`],
        [`<code>CopyOnWriteArrayList</code> write cost grows with size, because all elements are copied. <code>LongAdder</code> and <code>ConcurrentHashMap</code> scale well with more threads. Queue choice affects latency: <code>ArrayBlockingQueue</code> uses one lock, <code>LinkedBlockingQueue</code> uses two, and the LMAX Disruptor library gives extreme throughput. Benchmark with JMH under realistic thread counts.`,
            r`List<Integer> cow = new CopyOnWriteArrayList<>();
long t = System.nanoTime();
for (int i = 0; i < 50_000; i++) cow.add(i);
long ms = (System.nanoTime() - t) / 1_000_000;
System.out.println("50k appends ms=" + ms);

// OUTPUT: (varies; quadratic growth)
// 50k appends ms=900`],
        [`Real-world: an in-memory session store, a rate limiter counting requests per user, and a work queue between request threads and a writer thread.`,
            r`ConcurrentHashMap<String, LongAdder> perUser = new ConcurrentHashMap<>();
boolean allowed(String user, long limit) {
    LongAdder n = perUser.computeIfAbsent(user, k -> new LongAdder());
    n.increment();                 // count this request
    return n.sum() <= limit;       // a timer would reset counts each window
}
BlockingQueue<AuditEvent> audit = new ArrayBlockingQueue<>(10_000);
// request threads: audit.offer(event)
// writer thread:   batch = new ArrayList<>(); audit.drainTo(batch, 500);

// OUTPUT:
// requests never block on slow audit writes (offer fails fast when full)`]
    ),

    'locks-in-java': dv(
        [`Locks are built on <code>AbstractQueuedSynchronizer</code> (AQS): an int state plus a FIFO wait queue of parked threads (<code>LockSupport.park</code>). ReentrantLock stores the owner and hold count; fair mode grants in arrival order (slower), non-fair allows barging (faster). <code>ReentrantReadWriteLock</code> packs reader and writer counts in the state. StampedLock uses a version stamp for optimistic reads.`,
            r`ReentrantLock fair = new ReentrantLock(true);
fair.lock(); fair.lock();
System.out.println(fair.isFair() + " holds=" + fair.getHoldCount()
        + " locked=" + fair.isLocked());
fair.unlock(); fair.unlock();
System.out.println(fair.isLocked());

// OUTPUT:
// true holds=2 locked=true
// false`],
        [`Patterns: lock ordering to avoid deadlock, <code>tryLock</code> with back-off, hand-over-hand locking, lock striping, condition queues (<code>await</code>/<code>signal</code>), read-write caches, and lock-free alternatives (atomics, <code>VarHandle</code>). In Java 21+, synchronized blocks can pin virtual threads (improved in later JDKs); <code>ReentrantLock</code> parks virtual threads cleanly.`,
            r`// Lock striping: 16 locks, each key maps to one of them
class Striped<K, V> {
    private final Object[] locks = new Object[16];
    private final Map<K, V> map = new HashMap<>();

    Striped() { for (int i = 0; i < locks.length; i++) locks[i] = new Object(); }

    Object lockFor(K k) { return locks[(k.hashCode() & 0x7fffffff) % locks.length]; }

    void update(K k, UnaryOperator<V> f) {
        synchronized (lockFor(k)) { map.compute(k, (kk, v) -> f.apply(v)); }
    }
}

// tryLock with back-off: take two locks, or give up
boolean transfer(Lock a, Lock b, Runnable work) throws InterruptedException {
    if (!a.tryLock(50, TimeUnit.MILLISECONDS)) return false;
    try {
        if (!b.tryLock(50, TimeUnit.MILLISECONDS)) return false;
        try {
            work.run();
            return true;
        } finally { b.unlock(); }
    } finally { a.unlock(); }
}   // on false, the caller backs off and retries

// OUTPUT:
// updates to different keys proceed in parallel; failed lock attempts back off instead of deadlocking`],
        [`Mistakes: unlock outside finally, unlock without owning (IllegalMonitorStateException), lock in one method and unlock in another, awaiting a Condition without holding the lock, signaling instead of signalAll when several waiters have different predicates, ignoring the interrupt, and holding a lock while calling listeners (alien code).`,
            r`ReentrantLock l = new ReentrantLock();
try { l.unlock(); } catch (IllegalMonitorStateException e) { System.out.println("not the owner"); }
Condition c = l.newCondition();
try { c.await(); } catch (IllegalMonitorStateException e) { System.out.println("must hold the lock to await"); }

// OUTPUT:
// not the owner
// must hold the lock to await`],
        [`Uncontended synchronized and ReentrantLock cost about the same; under contention, fairness hurts throughput (many context switches). StampedLock optimistic reads avoid writes to shared memory, which scales best for read-heavy workloads. Profile lock contention with JFR (<code>jdk.JavaMonitorEnter</code>, <code>jdk.ThreadPark</code>).`,
            r`// Print lock events from a recording (Windows findstr; use grep elsewhere)
// jfr print --events jdk.JavaMonitorEnter,jdk.ThreadPark rec.jfr | findstr duration
// jdk.JavaMonitorEnter { duration = 38.2 ms  monitorClass = com.acme.Inventory }

// OUTPUT:
// the most contended lock classes are listed with wait times`],
        [`Real-world: a scheduler uses a ReentrantLock with two Conditions (notFull, notEmpty) for a bounded work queue, and a read-write lock for rarely changed configuration.`,
            r`class BoundedQueue<T> {
    final Lock l = new ReentrantLock();
    final Condition notFull = l.newCondition();
    final Condition notEmpty = l.newCondition();
    final Object[] items;
    int head, tail, count;

    BoundedQueue(int n) { items = new Object[n]; }

    void put(T t) throws InterruptedException {
        l.lock();
        try {
            while (count == items.length) notFull.await();
            items[tail] = t;
            tail = (tail + 1) % items.length;
            count++;
            notEmpty.signal();
        } finally { l.unlock(); }
    }

    @SuppressWarnings("unchecked")
    T take() throws InterruptedException {
        l.lock();
        try {
            while (count == 0) notEmpty.await();
            T t = (T) items[head];
            head = (head + 1) % items.length;
            count--;
            notFull.signal();
            return t;
        } finally { l.unlock(); }
    }
}

// OUTPUT:
// producers wait when full, consumers wait when empty, with no busy waiting`]
    ),

    'exception-handling': dv(
        [`When an exception is thrown the JVM searches the current method exception table for a matching handler (by type and bytecode range); if none, it pops the frame and searches the caller. <code>finally</code> is compiled by duplicating its code on every exit path. The stack trace is captured in the constructor (<code>fillInStackTrace</code>), which is the costly part. <code>try-with-resources</code> closes in reverse order and adds suppressed exceptions.`,
            r`class R implements AutoCloseable {
    final String n;
    R(String n) { this.n = n; System.out.println("open " + n); }
    public void close() { System.out.println("close " + n); }
}

// inside a method:
try (R a = new R("A"); R b = new R("B")) {
    System.out.println("body");
    throw new IllegalStateException("x");
} catch (IllegalStateException e) {
    System.out.println("caught " + e.getMessage());
}

// OUTPUT:
// open A
// open B
// body
// close B
// close A
// caught x`],
        [`Good practices:<ul><li><b>Fail fast</b>: validate input early and catch narrowly.</li><li><b>Translate and keep the cause</b> at layer boundaries.</li><li><b>Log once</b> at the boundary with context (ids), not at every layer.</li><li><b>Clean up</b> in <code>finally</code> or try-with-resources.</li><li><b>Domain exceptions</b> for business failures; no exceptions as flow control.</li><li>Use <code>Optional</code> or result types for expected absences.</li><li><b>Global handlers</b> (<code>@RestControllerAdvice</code>, uncaught exception handler) are the last line.</li></ul>`,
            r`@RestControllerAdvice
class Errors {
    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<Map<String, String>> notFound(NotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> other(Exception e) {
        log.error("unexpected", e);
        return ResponseEntity.status(500).body(Map.of("error", "internal error"));
    }
}

// OUTPUT:
// 404 for missing resources; 500 with no stack trace leak for anything else`],
        [`Common mistakes:<ul><li>Empty <code>catch</code> blocks, or catching <code>Throwable</code>.</li><li>Logging and rethrowing (duplicate logs).</li><li>Losing the cause: <code>throw new X(e.getMessage())</code>.</li><li>Returning <code>null</code> on error.</li><li><code>printStackTrace</code> instead of a logger.</li><li>An exception in <code>finally</code> masking the original one.</li><li>Using exceptions to validate expected input.</li></ul>`,
            r`// BAD: cause and stack trace are lost
try { process(); }
catch (Exception e) { throw new RuntimeException(e.getMessage()); }

// GOOD: keep the cause
try { process(); }
catch (Exception e) { throw new RuntimeException("process failed for order 42", e); }

// OUTPUT:
// the second version shows the original stack trace under "Caused by"`],
        [`Throwing is slow (microseconds) mainly because of stack trace capture; in hot paths use validation methods that return booleans or Optional. A try block without a thrown exception costs nothing. Pre-allocated, stackless exceptions are possible for rare control flow cases.`,
            r`class FastFail extends RuntimeException {
    FastFail() { super("fast", null, false, false); }   // no stack trace
}

// inside a method:
long t = System.nanoTime();
for (int i = 0; i < 200_000; i++) {
    try { throw new FastFail(); } catch (FastFail e) { }
}
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=8`],
        [`Real-world: a service layer translating persistence failures into domain exceptions, one handler mapping them to HTTP codes, and structured logs with a correlation id.`,
            r`public Order find(long id) {
    try {
        return repo.findById(id)
                   .orElseThrow(() -> new NotFoundException("order " + id));
    } catch (DataAccessException e) {
        throw new ServiceUnavailableException("order store unavailable", e);
    }
}

// OUTPUT:
// 404 for unknown orders, 503 when the database is down`]
    ),

    'exceptions': dv(
        [`Class hierarchy: <code>Throwable</code> to <code>Error</code> and <code>Exception</code>; <code>RuntimeException</code> (unchecked) extends Exception. The compiler's checked analysis applies to Exception subclasses outside RuntimeException. Generic type erasure means exception classes cannot be generic. Sneaky throw can bypass checked rules, but is discouraged.`,
            r`Throwable t = new IOException("disk");
System.out.println((t instanceof Exception) + " " + (t instanceof RuntimeException)
    + " " + (new Error() instanceof Exception));
for (Class<?> c = IllegalArgumentException.class; c != null; c = c.getSuperclass()) {
    System.out.print(c.getSimpleName() + " ");
}
System.out.println();

// OUTPUT:
// true false false
// IllegalArgumentException RuntimeException Exception Throwable Object`],
        [`<ul><li><b>Choosing</b>: use checked exceptions for recoverable failures the caller can act on (rare in modern code). Use unchecked for precondition and programming errors. Use domain exceptions with codes for APIs.</li><li><b>Bridging helpers</b>: <code>UncheckedIOException</code>, functional interfaces that throw (<code>ThrowingFunction</code>), and <code>CompletionException</code> in async code.</li><li><b>Common unchecked</b>: <code>IllegalArgumentException</code>, <code>IllegalStateException</code>, <code>UnsupportedOperationException</code>, <code>NullPointerException</code>, <code>ArithmeticException</code>.</li></ul>`,
            r`@FunctionalInterface
interface ThrowingFunction<T, R> { R apply(T t) throws Exception; }

static <T, R> Function<T, R> unchecked(ThrowingFunction<T, R> f) {
    return t -> {
        try { return f.apply(t); }
        catch (Exception e) { throw new RuntimeException(e); }
    };
}
List<String> texts = Stream.of("a.txt")
    .map(unchecked(p -> Files.readString(Path.of(p)))).toList();

// OUTPUT:
// checked exceptions become unchecked inside the stream`],
        [`<p>Common mistakes:</p><ul><li>Throwing a generic <code>Exception</code> or <code>RuntimeException</code>.</li><li>Using checked exceptions for programming errors.</li><li>Catching <code>NullPointerException</code> instead of fixing the null.</li><li>Extending <code>Exception</code> when <code>RuntimeException</code> fits.</li><li>Empty messages, or mixing error codes with exceptions.</li></ul><p>A good message says what failed, with values and context.</p>`,
            r`throw new Exception("error");                      // useless
throw new OrderNotFoundException(                   // actionable
    "Order " + id + " not found for customer " + cust);

// OUTPUT:
// the second message identifies the failure at a glance in logs`],
        [`Checked exceptions make APIs verbose and break lambdas. Unchecked exceptions keep signatures clean but need documentation. Neither affects normal-path performance. Keep hierarchies shallow.`,
            r`/** @throws OrderNotFoundException if no order has this id */
Order get(long id);

// OUTPUT:
// the contract is documented even though the exception is unchecked`],
        [`Real-world: Spring translates <code>SQLException</code> (checked) into the <code>DataAccessException</code> (unchecked) hierarchy, so service code is free of JDBC specifics.`,
            r`try { jdbc.update("INSERT INTO users(email) VALUES (?)", email); }
catch (DuplicateKeyException e) { throw new EmailAlreadyUsedException(email); }

// OUTPUT:
// a unique-constraint violation becomes a domain exception`]
    ),

    'error': dv(
        [`<code>Error</code> subclasses signal JVM-level problems.
<ul>
<li><code>StackOverflowError</code>: a thread stack (default about 512 KB to 1 MB, set with <code>-Xss</code>) is full.</li>
<li><code>OutOfMemoryError</code> variants: Java heap space, GC overhead limit exceeded, Metaspace, unable to create native thread, Direct buffer memory.</li>
<li><code>LinkageError</code> family: <code>NoClassDefFoundError</code> (class missing at run time or failed static init), <code>UnsatisfiedLinkError</code>, <code>ExceptionInInitializerError</code>.</li>
</ul>`,
            r`class Boom { static int v = 1 / Integer.parseInt("0"); }
try { new Boom(); }
catch (ExceptionInInitializerError e) { System.out.println("init failed: " + e.getCause()); }
try { new Boom(); }
catch (NoClassDefFoundError e) { System.out.println("second use: " + e.getMessage()); }

// OUTPUT:
// init failed: java.lang.ArithmeticException: / by zero
// second use: Could not initialize class Boom`],
        [`Diagnostics tools:
<ul>
<li>Heap dump analysis in Eclipse MAT (dominator tree, leak suspects).</li>
<li><code>jcmd GC.heap_info</code>, <code>jmap -histo</code>, <code>-Xlog:gc</code>, <code>-XX:NativeMemoryTracking=summary</code>, and JFR memory events.</li>
<li><code>-Xss</code> sets the stack size for deep recursion.</li>
</ul>
Fix leaks by bounding caches, removing listeners, clearing <code>ThreadLocal</code> values, closing resources and using weak references.`,
            r`// java -XX:NativeMemoryTracking=summary -Xlog:gc*:file=gc.log -jar app.jar
// jcmd <pid> VM.native_memory summary
// jmap -histo:live <pid> | head -20

// OUTPUT:
// the classes holding the most memory and the native memory breakdown`],
        [`Common mistakes:
<ul>
<li>Catching <code>Throwable</code> or <code>Error</code> and carrying on.</li>
<li>Raising <code>-Xmx</code> without finding the leak.</li>
<li>Deep recursion on user input (a denial-of-service risk).</li>
<li>Unbounded thread creation (causes "unable to create native thread"), queues and caches.</li>
<li>Loading huge files into memory, and relying on finalizers.</li>
</ul>
Prefer resource limits and backpressure.`,
            r`try {
    long[] huge = new long[Integer.MAX_VALUE];
} catch (OutOfMemoryError e) {
    System.out.println(e.getMessage());
}
// recursion depth that grows with input size: reject the input or use a loop

// OUTPUT:
// Requested array size exceeds VM limit`],
        [`GC tuning follows evidence: right-size the heap (<code>-Xms</code> equals <code>-Xmx</code> for stable services), choose a collector for latency goals, reduce allocation rate, avoid large object churn. In containers use <code>-XX:MaxRAMPercentage</code> and leave headroom for metaspace, threads and direct memory.`,
            r`// java -XX:MaxRAMPercentage=70 -XX:+UseG1GC -XX:MaxGCPauseMillis=200
//      -XX:+ExitOnOutOfMemoryError -jar app.jar

// OUTPUT:
// heap scales with the container limit and the process restarts cleanly on OOM`],
        [`Real-world: a service OOM-kills every few days; the heap dump shows a static map of sessions that is never evicted. Fix with a bounded Caffeine cache with expiry.`,
            r`Cache<String, Session> sessions = Caffeine.newBuilder()
    .maximumSize(50_000)
    .expireAfterAccess(Duration.ofMinutes(30))
    .build();

// OUTPUT:
// memory stays flat under load`]
    ),

    'error2': dv(
        [`Detailed semantics:<ul><li>If <code>try</code> throws and <code>finally</code> completes normally, the exception propagates.</li><li>If <code>finally</code> throws, it replaces the original, which is lost.</li><li>With try-with-resources the body exception is primary and close exceptions are suppressed (<code>getSuppressed</code>).</li><li>An exception in a static initializer becomes <code>ExceptionInInitializerError</code>.</li><li>If a constructor throws, the object is never returned, though a half-built object may have escaped.</li></ul>`,
            r`static String order() {
    StringBuilder sb = new StringBuilder();
    try {
        sb.append("try ");
        throw new RuntimeException("x");
    } catch (RuntimeException e) {
        sb.append("catch ");
        // return value is computed here, before finally runs
        return sb.append("return ").toString();
    } finally {
        sb.append("finally");
        System.out.println("finally ran, sb=" + sb);
    }
}
System.out.println(order());

// OUTPUT:
// finally ran, sb=try catch return finally
// try catch return`],
        [`Interview patterns to practise: a custom checked exception, exception chaining, multi-catch (the catch variable is implicitly final), precise rethrow, and try-with-resources with two resources.`,
            r`try {
    if (Math.random() > 2) throw new IOException();
    else throw new SQLException();
} catch (IOException | SQLException e) {   // e is implicitly final
    System.out.println(e.getClass().getSimpleName());
}

// precise rethrow: only the checked types the try block can throw
static void rethrow() throws IOException, SQLException {
    try { riskyIo(); riskySql(); }
    catch (Exception e) { throw e; }
}

// OUTPUT:
// SQLException`],
        [`Common wrong answers to avoid:`,
            r`// 1. finally always runs        -> not after System.exit()
// 2. exceptions are cheap       -> stack traces cost time and memory
// 3. catch (Exception) is fine  -> catch the most specific type you can handle
// 4. returning null is safer    -> prefer throwing or Optional
// 5. Errors should be caught    -> OutOfMemoryError is not recoverable

try {
    System.out.println("in try");
    System.exit(0);
} finally {
    System.out.println("finally");   // never runs
}

// OUTPUT:
// in try`],
        [`Logging answer: log one line for expected failures and a full stack trace only for unexpected ones. Add a correlation id to every line and rate-limit repeated errors to avoid log storms.`,
            r`// logback pattern with a trace id and a short stack trace:
// %d %-5level [%X{traceId}] %logger{36} - %msg%n%rEx{short}

// one line, no stack trace for an expected failure
log.warn("payment failed orderId={} reason={}", orderId, e.getMessage());

// OUTPUT:
// concise logs for expected failures; full traces only for unexpected ones`],
        [`Real-world answer: retry with exponential backoff only for transient exceptions, and make the operation idempotent (safe to repeat) so a retry cannot do harm.`,
            r`static <T> T retry(Callable<T> c, int max) throws Exception {
    for (int i = 1; ; i++) {
        try {
            return c.call();
        } catch (TransientException e) {
            if (i == max) throw e;                       // give up
            Thread.sleep(100L * (1L << (i - 1)));        // 100, 200, 400 ...
        }
    }
}

// OUTPUT:
// transient failures are retried 100, 200, 400 ms apart; permanent failures propagate immediately`]
    ),

    'exception-handling3': dv(
        [`<code>throw</code> compiles to <code>athrow</code>: it pops the throwable and the JVM searches the exception tables. The <code>throws</code> clause is metadata (an Exceptions attribute) used by the compiler only; the JVM does not enforce it. The stack trace is filled when the exception object is created, not when thrown, so creating without throwing still captures it.`,
            r`static Exception make() { return new Exception("created here"); }
// the trace was filled in make(), so it still shows make(), not thrower()
static void thrower() throws Exception { throw make(); }
try { thrower(); }
catch (Exception e) { System.out.println(e.getStackTrace()[0].getMethodName()); }

// OUTPUT:
// make`],
        [`Guidelines:
<ul>
<li>Use <code>IllegalArgumentException</code> for a bad argument value, or <code>requireNonNull</code> for null.</li>
<li>Use <code>IllegalStateException</code> when the object is in the wrong state.</li>
<li>Use <code>UnsupportedOperationException</code> for operations a class does not support.</li>
<li>Document with <code>@throws</code>, keep <code>throws</code> clauses short, and prefer unchecked exceptions in application code.</li>
<li>Chain causes with the constructor or <code>initCause</code>; <code>Throwable.addSuppressed</code> carries secondary failures.</li>
</ul>`,
            r`static int divide(int a, int b) {
    if (b == 0) {
        throw new IllegalArgumentException("divisor must not be zero (a=" + a + ")");
    }
    return a / b;
}
class Door {
    private boolean open;
    void close() {
        if (!open) throw new IllegalStateException("door already closed");
        open = false;
    }
}
try { divide(5, 0); }
catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }

// OUTPUT:
// divisor must not be zero (a=5)`],
        [`Common mistakes (rule of thumb: throw early, handle late):
<ul>
<li><code>throws Exception</code> on every method hides what can really fail.</li>
<li>Throwing from <code>finally</code> can hide the original exception.</li>
<li>Creating exceptions without a message or context.</li>
<li>Throwing <code>null</code>, which becomes a <code>NullPointerException</code>.</li>
<li>Declaring unchecked exceptions in <code>throws</code> without documenting them.</li>
<li>Logging and then rethrowing, which gives duplicate noise.</li>
</ul>`,
            r`try { throw null; }
catch (NullPointerException e) { System.out.println("throw null becomes NPE"); }
void bad() throws Exception { }     // callers must handle Exception: too broad
void good() throws IOException { }  // precise

// OUTPUT:
// throw null becomes NPE`],
        [`Throwing is cheap relative to I/O, but in hot loops pre-validate and avoid exceptions for control flow. Reuse static, stackless exceptions only in very specialized cases (parsers) with care for correctness.`,
            r`static boolean tryParse(String s) {
    try { Integer.parseInt(s); return true; }
    catch (NumberFormatException e) { return false; }
}
// cheaper when most inputs are invalid
static boolean looksNumeric(String s) {
    return s != null && s.matches("-?\\d+");
}

// OUTPUT:
// validate first when most inputs are expected to be invalid`],
        [`Real-world: a service method validates, throws domain exceptions, and a central handler maps them to HTTP responses.`,
            r`public void transfer(long from, long to, long cents) {
    if (cents <= 0) throw new IllegalArgumentException("amount must be positive");
    Account a = accounts.find(from)
        .orElseThrow(() -> new AccountNotFoundException(from));
    if (a.balance() < cents) throw new InsufficientFundsException(from, cents);
}

// OUTPUT:
// 400 invalid amount, 404 unknown account, 409 insufficient funds`]
    )
};
